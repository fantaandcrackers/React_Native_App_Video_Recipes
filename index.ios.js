/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

var realm = require('./realm/datastore.js');
var VideoService = require('./services/video_service.js');
var Dashboard = require('./App/video_list.js');
var FavoritesListView = require('./App/favorites_video_list.js');
var SearchListView = require('./App/search_video_list.js');
var PageListView = require('./App/page_list.js');
var InformationPage = require('./App/information_page.js');
var Background = require('./App/background.js').sayagata;

import React, { Component } from 'react';
import {
  AsyncStorage,
  AppRegistry,
  TabBarIOS,
  StatusBar,
  Dimensions,
  ListView,
  StyleSheet,
  TouchableHighlight,
  NavigatorIOS,
  Text,
  TextInput,
  View,
  Image
} from 'react-native';

var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
function setUpdate() {
  try {
    AsyncStorage.setItem('@MySuperStore:lastUpdate', new Date());
  } catch (error) {
    console.log(error);
  }
}
function daysSinceUpdate() {
  try {
    const value = AsyncStorage.getItem('@MySuperStore:lastUpdate');
    console.log("lastUpdate", value);
    if (value !== null){
      var diffDays = Math.round(Math.abs((Date() - value.getTime())/(oneDay)));
      return diffDays;
    } else {
      return 7
    }
  } catch (error) {
    console.log(error);
    return 7;
  }
}
function shouldUpdate() {
  return daysSinceUpdate() > 6;
}

console.log("Last update: " + Number(daysSinceUpdate()) + " days ago.");
if (shouldUpdate()) {
  VideoService.fetchPages();
  VideoService.fetchVideos();
  setUpdate();
  console.log('Updated today!');
}

// https://stackoverflow.com/questions/38107439/how-can-i-repeat-a-pattern-image-to-create-a-background-in-react-native


class VideoRecipes extends Component {
  constructor(props){
    super(props);
    this.state={
      selectedTab: 'pages'
    };
  }

  _touchRightButton(itemData) {
    realm.write(() => {
      var video = realm.objects('Video').filtered("fbid == '" + itemData.fbid + "'")[0];
      video.favorited = !video.favorited;
    });
  }

  // Favorite Page -> Information Page
  _handleNavigationRequest() {
    this.refs.favorites_nav.push({
      component: InformationPage,
      title: 'Info',
    });
  }

  render() {
    StatusBar.backgroundColor="#004699";
    return (
      <Background>
        <TabBarIOS
          // barTintColor='#74B4FF'
          // tintColor="white"
          style={styles.clearBackground}
          selectedTab={this.state.selectedTab}
        >
          <TabBarIOS.Item
            title = "Pages"
            icon={require('./images/pages.png')}
            selected={this.state.selectedTab === 'pages'}
            onPress={() => {
              this.setState({
                selectedTab: 'pages',
              });
            }}>
            <NavigatorIOS
              initialRoute={{
                component: PageListView,
                title: 'Pages',
                navigationBarHidden: true,
              }}
              style={styles.clearBackground}
              />
          </TabBarIOS.Item>
          <TabBarIOS.Item
            title = "Search"
              icon={require('./images/search.png')}
              selected={this.state.selectedTab === 'search'}
              onPress={() => {
                this.setState({
                  selectedTab: 'search',
                });
              }}>
              <NavigatorIOS
                style = {styles.container}
                initialRoute = {{
                  title: 'Search All Recipes',
                  component: SearchListView,
              }}
              style={styles.clearBackground}
              />
          </TabBarIOS.Item>
          <TabBarIOS.Item
            title = "Favorites"
              icon={require('./images/saved.png')}
              selected={this.state.selectedTab === 'saved'}
              onPress={() => {
                this.setState({
                  selectedTab: 'saved',
                  dummyRefresh: true,
                });
              }}>
              <NavigatorIOS
                ref='favorites_nav'
                initialRoute = {{

                  title: 'Favorites',
                  component: FavoritesListView,
                  rightButtonTitle: 'Info ',
                  onRightButtonPress: () => this._handleNavigationRequest(),
                  navigationBarHidden: false
                }}
                style={styles.clearBackground}
              />
          </TabBarIOS.Item>
        </TabBarIOS>
      </Background>
    );
  }
}

const styles = StyleSheet.create({
  clearBackground: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
AppRegistry.registerComponent('VideoRecipes', () => VideoRecipes);
