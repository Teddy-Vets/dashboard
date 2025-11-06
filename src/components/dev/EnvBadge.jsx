import React from 'react';
import { detectEnv } from './detectEnv';

const EnvBadge = () => {
  const { platform, env, showBadge } = detectEnv();

  if (!showBadge) {
    return null;
  }

  const getEnvColor = () => {
    switch (env) {
      case 'production': return 'bg-red-600';
      case 'preview': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div 
      className={`fixed bottom-2 left-2 px-2 py-1 text-white text-xs rounded-full z-50 shadow-lg ${getEnvColor()}`}
      style={{ writingMode: 'horizontal-tb' }}
    >
      {platform} &bull; {env}
    </div>
  );
};

export default EnvBadge;