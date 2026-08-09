# ThiKorben

ThiKorben is a mobile service marketplace designed to connect local households with trusted informal and skilled workers such as plumbers, electricians, carpenters, cleaners, and other service providers.

The platform is designed with simplicity and accessibility in mind, making it easier for customers to find nearby workers while helping workers discover local job opportunities and manage their services.

## Current Development

This repository currently focuses on the **mobile frontend** of ThiKorben.

The frontend is being developed using:

- React Native
- TypeScript
- Expo
- React Navigation
- Leaflet / OpenStreetMap for map-based features
- Zustand for state management

At this stage, the application uses mock/local data. Backend services, authentication, payments, and API integration will be implemented in later development phases.

## Main User Types

### 👷 Workers
Workers will be able to:

- Create and manage their profiles
- Select their trade/service
- Set their service area
- Set their preferred service rate
- Receive nearby job requests
- Accept or negotiate jobs
- Track completed work and earnings
- Build their reputation through ratings and reviews

### 🏠 Customers
Customers will be able to:

- Search for local services
- Find nearby verified workers
- View worker profiles and ratings
- Request services
- Negotiate prices
- Track workers
- Confirm completed jobs
- Rate and review workers

## Project Structure

The project follows a component-based React Native architecture designed to keep the frontend scalable and easy to integrate with the future backend.

```text
src/
├── components/
├── screens/
├── navigation/
├── store/
├── data/
├── types/
├── theme/
└── utils/