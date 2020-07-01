import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { db } from '../database';
import { getManifest } from '../utils/socrata';

import DBWorker from '../workers/database.worker';

export const AppContext = createContext();

const initalState = {
  stateLoaded: false,
  lastUpdated: [],
  databaseRefreshedAt: null,
};

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'HYDRATE_STATE':
      return { ...state, ...payload };
    case 'DATABASE_UPDATED':
      return { ...state, databaseRefreshedAt: new Date() };
    case 'SET_LOADED':
      return { ...state, stateLoaded: true };
    case 'SET_PORTAL_UPDATED':
      return {
        ...state,
        lastUpdated: state.lastUpdated.map((l) => l.portal).includes(payload)
          ? state.lastUpdated.map((l) =>
              l.portal === payload ? { ...l, updated_at: new Date() } : l,
            )
          : [...state.lastUpdated, { portal: payload, updated_at: new Date() }],
      };
    default:
      return state;
  }
};

const updateManifestFromSocrata = (dispatch, portal) => {
  const worker = new DBWorker();
  getManifest(portal.socrataDomain).then((manifest) => {
    worker.postMessage({ manifest, portal });
    worker.addEventListener('message', (message) => {
      console.log('worker message ', message);
      if (message.data.event === 'database_updated') {
        dispatch({
          type: 'DATABASE_UPDATED',
        });
        dispatch({
          type: 'SET_LOADED',
        });
      }
      if (message.data.event === 'all_loaded') {
        dispatch({
          type: 'DATABASE_UPDATED',
        });

        dispatch({
          type: 'SET_PORTAL_UPDATED',
          payload: portal.socrataDomain,
        });
      }
    });
  });
};

// Checks to see if the cache is older than 1 daym if so update it
const shouldUpdateCache = (lastUpdated) => {
  if (lastUpdated == null) return true;
  if ((new Date() - lastUpdated) / 1000 > 24 * 60 * 60) return true;
  return false;
};

export const OpenDataProvider = ({ children, portal }) => {
  const [state, dispatch] = useReducer(reducer, initalState);

  // Try to get the state locally from indexed db... if we can't find it there, request it from the
  // socrata API
  //
  //

  // useEffect(()=>{
  //   db.Datasets.hook('creating',()=>{
  //     dispatch({
  //       type:'DATABASE_UPDATED'
  //     })
  //   })
  // })

  useEffect(() => {
    if (!portal) {
      return;
    }
    db.SocrataCache.get(0).then((result) => {
      if (result) {
        const cachedState = JSON.parse(result.data);
        const lastUpdateForPortal = cachedState.lastUpdated.find(
          (p) => p.portal === portal.socrataDomain,
        );
        if (
          shouldUpdateCache(
            lastUpdateForPortal
              ? new Date(lastUpdateForPortal.updated_at)
              : null,
          )
        ) {
          updateManifestFromSocrata(dispatch, portal);
        } else {
          dispatch({
            type: 'HYDRATE_STATE',
            payload: {
              ...initalState,
              ...cachedState,
              cache_loaded: true,
            },
          });
          // Set state as loaded to indicate that data is ready to use
          dispatch({
            type: 'SET_LOADED',
          });
        }
      } else {
        updateManifestFromSocrata(dispatch, portal);
      }
    });
  }, [portal]);

  // useEffect(() => {
  //   const refreshDB = () => {
  //     // debounce(() => {
  //     dispatch({
  //       type: 'DATABASE_UPDATED',
  //     });
  //     // }, 1000);
  //   };
  //   db.Datasets.hook('updating', refreshDB);
  //   db.Datasets.hook('creating', refreshDB);

  //   return () => {
  //     db.Datasets.hook('updating').unsubscribe(refreshDB);
  //     db.Datasets.hook('creating').unsubscribe(refreshDB);
  //   };
  // }, []);

  // If our datasets change, update the cahced version
  const { stateLoaded, lastUpdated } = state;
  useEffect(() => {
    if (stateLoaded) {
      db.SocrataCache.put({
        data: JSON.stringify({
          lastUpdated,
        }),
        id: 0,
      });
    }
  }, [stateLoaded, lastUpdated, portal]);

  return (
    <AppContext.Provider value={[{ ...state, portal }, dispatch, db]}>
      {children}
    </AppContext.Provider>
  );
};

export const useStateValue = () => useContext(AppContext);
