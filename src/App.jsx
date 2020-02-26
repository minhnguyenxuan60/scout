import React from 'react';
import './App.scss';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { ModalContainer, ModalRoute } from 'react-router-modal';

import SideNav from './components/SideNav/SideNav';
import HomePage from './layout/HomePage/HomePage';
import DatasetPage from './layout/DatasetPage/DatasetPage';
import CollectionBar from './components/CollectionBar/CollectionBar';
import CollectionPage from './layout/CollectionPage/CollectionPage';
import CreateCollectionModal from './components/CreateCollectionModal/CreateCollectionModal';
import WelcomeModal, {
  WelcomeRedirect,
} from './components/WelcomeModal/WelcomeModal';
import GHPagesRedirect from './components/GHPagesRedirect/GHPagesRedirect';

import 'react-router-modal/css/react-router-modal.css';

function App() {
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <ModalContainer />
        <SideNav />
        <div className="content">
          <GHPagesRedirect />
          <Switch>
            <Route path="/dataset/:datasetID" component={DatasetPage} />
            <Route
              path="/collection/:name/:datasetIDs"
              component={CollectionPage}
            />

            <ModalRoute
              path="/collection/new"
              parentPath="/"
              component={CreateCollectionModal}
            />
            <Route path="/" component={HomePage} />
            <Redirect from="/" to="/" />
          </Switch>
          <WelcomeRedirect />
          <ModalRoute path="/welcome" parentPath="/" component={WelcomeModal} />
          <CollectionBar />
        </div>
      </Router>
    </div>
  );
}

export default App;
