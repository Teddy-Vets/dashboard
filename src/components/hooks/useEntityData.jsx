import { useState, useEffect, useCallback, useMemo } from 'react';
import { getEntityList, getEntityById } from '@/components/utils/apiHelpers';

/**
 * Hook מותאם לטעינת נתוני ישות עם caching ו-error handling
 */
export function useEntityList(Entity, filters = {}, sortBy = '-created_date', limit = null, entityName = 'Entity') {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // המרה ל-string כדי לאפשר השוואה נכונה
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const parsedFilters = JSON.parse(filtersKey);
      const result = await getEntityList(Entity, parsedFilters, sortBy, limit, entityName);
      setData(result);
    } catch (err) {
      console.error(`[useEntityList] Error loading ${entityName}:`, err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [Entity, filtersKey, sortBy, limit, entityName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
}

/**
 * Hook לטעינת ישות בודדת לפי ID
 */
export function useEntityById(Entity, id, entityName = 'Entity') {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!id) {
      setError(new Error(`No ID provided for ${entityName}`));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getEntityById(Entity, id, entityName);
      setData(result);
    } catch (err) {
      console.error(`[useEntityById] Error loading ${entityName}:`, err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [Entity, id, entityName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
}

/**
 * Hook לטעינת מספר ישויות במקביל
 */
export function useMultipleEntities(entityConfigs) {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // המרה ל-string כדי לאפשר השוואה נכונה
  const configsKey = useMemo(() => JSON.stringify(entityConfigs), [entityConfigs]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const configs = JSON.parse(configsKey);
      const promises = configs.map(async (config) => {
        const { key, Entity, filters = {}, sortBy = '-created_date', limit = null, name = 'Entity' } = config;
        const result = await getEntityList(Entity, filters, sortBy, limit, name);
        return { key, result };
      });

      const results = await Promise.all(promises);
      const dataMap = {};
      results.forEach(({ key, result }) => {
        dataMap[key] = result;
      });
      
      setData(dataMap);
    } catch (err) {
      console.error('[useMultipleEntities] Error loading entities:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [configsKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
}