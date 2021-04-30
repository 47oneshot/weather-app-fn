import { StatusBar } from 'expo-status-bar';
import React,{useState,useEffect} from 'react';
import { StyleSheet, Text, View,PermissionsAndroid,Platform,Dimensions, Image,TouchableOpacity,Linking} from 'react-native';
import Geolocation from '@react-native-community/geolocation'
import Constants from 'expo-constants';
import * as Animatable from 'react-native-animatable';
import { useFonts } from 'expo-font';
import Regular from './assets/fonts/Poppins-Regular.ttf';
import Bold from './assets/fonts/Poppins-Bold.ttf';
import ExtraBold from './assets/fonts/Poppins-ExtraBold.ttf';

export const windowWidthPx = Dimensions.get('window').width/100;
export const windowHeightPx = Dimensions.get('window').height/100;

import AsyncStorage from '@react-native-async-storage/async-storage';
import {  FontAwesome5  as Icon } from '@expo/vector-icons';
export default function App() {

 
  


const [loaded] = useFonts({
  Regular,
  Bold,
  ExtraBold,
});
let watchID=null;
const weather_api='3e36c0c35ecda86a5fd164dfe00bccee';

const [latitude, setLatitude] = useState('');
const [longitude, setLongitude] = useState('');
const [hideMe,setHideMe]=useState(false);
const [weather,setWeather]=useState({});
let latitudeFixed = Number(latitude).toFixed(4);
let longitudeFixed =Number(longitude).toFixed(4)
//alert(latitudeFixed)




useEffect(() => {

needPermission();

getPrev(); 
getWeatherDetails();
//getWeatherDetails();

return () => {
Geolocation.clearWatch(watchID);
needPermission();
getCurrentLocation();
getPrev(); 
getWeatherDetails();
clearInterval(interval);
  }

}, [latitudeFixed,longitudeFixed])


let interval = setInterval(() => {
  getCurrentLocation ();
 },25000);
 
const needPermission = async()=> {
  
  if(Platform.OS === 'ios'){
     getCurrentLocation();
  }else{
    async function requestLocationPermission() {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
        //  PermissionsAndroid.PERMISSIONS.INTERNET,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,      
        ]);

        //console.log(PermissionsAndroid.RESULTS.GRANTED);
        return  getCurrentLocation();
        
      } catch (err) {
        console.error(err)
      }
    }
    requestLocationPermission();
  } 
}


if(Object.keys(weather).length==0 || Object.keys(weather).length==undefined ){
 ()=>{
  getWeatherDetails();
 } 
}

const getWeatherDetails = async() => {

  let response = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weather_api}`);

  let json = await response.json();
   
  let updateWeather ={
    temp:parseInt( json.main.temp)-273,
    maxTemp:parseInt(json.main.temp_max)-273,
    minTemp:parseInt(json.main.temp_min)-273,
    feelLike:parseInt(json.main.feels_like)-273,
    humidity:json.main.humidity,
    cityName:json.name,
    wetherType:json.weather[0].main,
    weatherDes:json.weather[0].description,
    icon : json.weather[0].icon,

  }
  setTimeout(async() => {
  setWeather(updateWeather);
  await AsyncStorage.setItem('PrevWeather', JSON.stringify(updateWeather));
  setHideMe(true);
  //alert(weather.cityName);

  }, 2500);
  
  
  
}



const getCurrentLocation=()=>{

 
  Geolocation.getCurrentPosition(
    (position) => {
       setLatitude(JSON.stringify(position.coords.latitude));
       setLongitude(JSON.stringify(position.coords.longitude))
     //  alert(position.coords.latitude);
    },
    (error) => console.log(error.message),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
 );

  watchID = Geolocation.watchPosition((position) => {
    const lastPosition = JSON.stringify(position);
    
 });


}

const getPrev = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('PrevWeather')
    if(jsonValue != null) {
      setTimeout(() => {
      setWeather(JSON.parse(jsonValue));
      setHideMe(true);
      }, 2000);
      
    }
  } catch(e) {
    console.error(e);
  }
}


{/*
if ( hideMe==false) {
  
  return (
    <View style={{flex:1}}>
    <Image
     style={{alignSelf:'center',width:windowWidthPx*100,height:windowHeightPx*60}} source={require('./assets/indicator.gif')}/>
    </View>
  )

}*/}
let content = `Today's temperature in ${weather.cityName} is ${weather.temp} °c. Day's maximum temperature
would hover at ${weather.maxTemp}°c, while minimum temperature is predicted to be ${weather.minTemp}°c.`
shareToWhatsApp = (text) => {
  Linking.openURL(`whatsapp://send?text=${text}`);
 }

  return (
      
    

    <View style={styles.container}>

    {hideMe===true?(
    <View style={{flex:1,backgroundColor:'#f8f8f8'}}>
    <StatusBar style='auto'/> 
    

    <View style={{paddingLeft:windowWidthPx*2,paddingVertical:windowHeightPx*3,backgroundColor:'#e3bb88'}}>
    <Text style={[styles.title,{fontSize:windowWidthPx*5}]}>City : {weather.cityName}</Text>
    </View>
   

    <View style={{paddingVertical:windowHeightPx*4,alignItems:'center',justifyContent:'center'}}>
    <Animatable.Image animation="slideInUp" easing='ease-in' iterationDelay={200} iterationCount={'infinite'} direction="alternate"
     style={{height:windowHeightPx*30,width:windowWidthPx*90,alignSelf:'center'}} source={{uri : `http://openweathermap.org/img/wn/${weather.icon}@4x.png`}}/>
    </View>
    
    <View style={{justifyContent:'center',padding:windowWidthPx*5,paddingVertical:windowHeightPx*5,marginTop:windowHeightPx*5,flexDirection:'row',backgroundColor:'#b1695a',borderTopStartRadius:windowWidthPx*7,borderTopRightRadius:windowWidthPx*7,}}>
    <View style={{flex:1,justifyContent:'flex-start'}}>
    <Text style={styles.mainTemp} >{weather.temp}&#176;C</Text>
    <Text style={[styles.header,{textTransform:'capitalize'}]} >{(weather.weatherDes)}</Text>
    </View>
    <View style={{flex:1,alignItems:'flex-start',justifyContent:'center',paddingLeft:windowWidthPx*2}}>
    <Text style={styles.title} >Feel Like :  {weather.feelLike}&#176;C</Text>
    <Text style={styles.title} >Max Temp :  {weather.maxTemp}&#176;C</Text>
    <Text style={styles.title} >Min Temp :  {weather.minTemp}&#176;C</Text>
    <Text style={styles.title} >Humidity :  {weather.humidity}</Text>
    </View>
    </View>
   
    
    <View>
    <TouchableOpacity onPress={()=>shareToWhatsApp(content)} style={{margin:windowWidthPx*3,padding:windowWidthPx,alignSelf:'flex-end',width:windowWidthPx*14,borderRadius:50,backgroundColor:'#644749',justifyContent:'center',alignItems:'center'}}>
    <Icon name="whatsapp" size={24} color={'#fff'} />
    <Text style={{fontFamily:'Regular',color:'#fff'}}>Share</Text>
    </TouchableOpacity>
    </View>
    
    </View>
    ):(
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
    <Image
     style={{alignSelf:'center',width:windowWidthPx*100,height:windowHeightPx*60}} source={require('./assets/indicator.gif')}/>
    <Animatable.Text style={styles.title} animation="slideInDown" iterationCount={'infinite'} direction="alternate">Please wait... </Animatable.Text>
    </View>
    )}

    </View>
  

  );


  

 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:Constants.statusBarHeight,
    margin:0,
    padding:0,
    
  },
  header:{
    fontFamily:'Regular',
    fontSize:windowWidthPx*5,
    color:'#fff'
    
  },
  title:{
    fontFamily:'Bold',
    fontSize:windowWidthPx*4,
    color:'#fff'
    
    
  },
mainTemp:{
 fontSize:windowWidthPx*12,
 fontFamily:'Bold',
 color:'#fff'
}
});
