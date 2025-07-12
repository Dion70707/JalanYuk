import React, { useState } from 'react';
import { Image } from 'react-native';

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x200.png?text=No+Image';

export default function ImageWithFallback({ uri, style }) {
  const [error, setError] = useState(false);
  return (
    <Image
      source={{ uri: error ? FALLBACK_IMAGE : uri }}
      style={style}
      onError={() => setError(true)}
      resizeMode="cover"
    />
  );
}
