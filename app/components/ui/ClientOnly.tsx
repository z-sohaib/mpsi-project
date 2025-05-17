import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ClientOnly: React.FC<{
  children: () => React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children()}</>;
};

ClientOnly.propTypes = {
  children: PropTypes.func.isRequired,
  fallback: PropTypes.node,
};

export default ClientOnly;
