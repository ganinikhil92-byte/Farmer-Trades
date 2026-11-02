import React from 'react';
import FarmerStocks from './FarmerStocks';

/**
 * Backward compatibility wrapper for /farmer/crop-stocks route
 */
export default function CropStocks() {
  return <FarmerStocks defaultCategory="CEREALS_MILLETS" />;
}
