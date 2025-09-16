# Almanak Token Comparison App

A React application that compares Almanak token FDV with Giza and Newton Protocol tokens, featuring a backend proxy to handle CORS issues with the Arma API.

## Features

- **Token Comparison**: Compare Almanak token FDV with Giza and Newton Protocol
- **Arma Protocol Integration**: Real-time data from Arma API via backend proxy
- **TVL Analysis**: Compare Total Value Locked between protocols
- **Custom Points Calculator**: Calculate the value of your points at different FDVs
- **Responsive Design**: Modern UI with Tailwind CSS

## Prerequisites

- Node.js 18+ (for global fetch support)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd almanak
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode (Recommended)

Run both the backend server and React app simultaneously:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- React app on `http://localhost:3000`

### Production Mode

1. Build the React app:
```bash
npm run build
```

2. Start the production server:
```bash
npm run server
```

The application will be available at `http://localhost:3001`

## Deployment to Render

### Automatic Deployment

1. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Create a new Web Service

2. **Configure the Service**:
   - **Name**: `almanak-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run server`
   - **Health Check Path**: `/api/health`

3. **Environment Variables** (optional):
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will override this)

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### Manual Deployment

If you prefer to deploy manually:

1. **Build the application**:
```bash
npm run build
```

2. **Upload to Render**:
   - Upload the entire project directory
   - Render will use the `render.yaml` configuration

## API Endpoints

### Backend Proxy Endpoints

- `GET /api/arma/stats` - Proxy to Arma API (https://api.arma.xyz/api/v1/8453/stats)
- `GET /api/pulse/stats` - Proxy to Pulse API (https://api.usepulse.xyz/api/v1/metrics/stats)
- `GET /api/health` - Health check endpoint

### External APIs Used

- **CoinGecko API**: Token price and market data (including ETH price for conversion)
- **DefiLlama API**: TVL data for Almanak
- **Arma API**: Giza TVL data (USD values, via backend proxy)
- **Pulse API**: Additional Giza TVL data (ETH values converted to USD, via backend proxy)

## Project Structure

```
almanak/
├── src/
│   ├── components/
│   │   ├── ComparisonCard.tsx    # Main comparison component
│   │   ├── ErrorDisplay.tsx      # Error handling component
│   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   └── TokenCard.tsx         # Individual token display
│   ├── services/
│   │   └── coingecko.ts         # CoinGecko API service
│   ├── types.ts                 # TypeScript interfaces
│   ├── utils/
│   │   └── formatters.ts        # Utility functions
│   ├── App.tsx                  # Main application component
│   └── index.tsx                # Application entry point
├── server.js                    # Express.js backend server
├── render.yaml                  # Render deployment configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Backend Proxy Solution

The application includes a backend proxy server to handle CORS issues with the Arma API. The proxy:

1. **Fetches Giza TVL data** from `https://api.arma.xyz/api/v1/8453/stats`
2. **Extracts only the TVL value** (total_balance) for calculations
3. **Handles errors** gracefully
4. **Provides CORS headers** for cross-origin requests

### Why a Backend Proxy?

The Arma API doesn't support CORS, which prevents direct browser requests. The backend proxy solves this by:

- Making server-to-server requests (no CORS restrictions)
- Adding proper CORS headers to responses
- Providing a clean API interface for the frontend
- Only exposing the necessary TVL data, not full protocol statistics

## Available Scripts

- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm run server` - Start backend server
- `npm run dev` - Start both backend and frontend in development
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App
- `npm run render-postbuild` - Post-build script for Render

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_BACKEND_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
```

For production deployment on Render, these are automatically configured.

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend server is running on the correct port and the frontend is configured to use the correct backend URL.

### API Rate Limits
The application uses multiple external APIs. If you encounter rate limiting:
- CoinGecko: 50 calls/minute for free tier
- DefiLlama: No rate limits
- Arma API: No documented rate limits

### Port Conflicts
If port 3001 is already in use, you can change it by setting the `PORT` environment variable.

### Render Deployment Issues
- Ensure Node.js version is 18+ (specified in package.json engines)
- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Verify the build command completes successfully
- Check the health check endpoint is accessible

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
