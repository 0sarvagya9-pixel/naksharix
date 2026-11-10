import {useEffect,useState} from "react";
import {BackHandler,Pressable,StyleSheet,Text,View} from "react-native";
import {SafeAreaProvider,SafeAreaView} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {HomeScreen} from "./src/screens/HomeScreen";
import {HoroscopeScreen} from "./src/screens/HoroscopeScreen";
import {PanchangScreen} from "./src/screens/PanchangScreen";
import {ExploreScreen} from "./src/screens/ExploreScreen";
import {AccountScreen} from "./src/screens/AccountScreen";
import {NumerologyScreen} from "./src/native/NumerologyScreen";
import {colors} from "./src/ui/theme";
import type {AppTab,MainTab} from "./src/navigation/tabs";

const tabs:ReadonlyArray<{id:MainTab;label:string;symbol:string}>=[
  {id:"home",label:"Home",symbol:"⌂"},
  {id:"horoscope",label:"Rashifal",symbol:"☼"},
  {id:"panchang",label:"Panchang",symbol:"☾"},
  {id:"discover",label:"Explore",symbol:"✦"},
  {id:"account",label:"Account",symbol:"◎"}
];

export default function App(){
  const [screen,setScreen]=useState<AppTab>("home");
  useEffect(()=>{
    const listener=BackHandler.addEventListener("hardwareBackPress",()=>{
      if(screen==="home")return false;
      setScreen(screen==="numerology"?"home":"home");
      return true;
    });
    return ()=>listener.remove();
  },[screen]);
  return <SafeAreaProvider>
    <SafeAreaView style={styles.root} edges={["top","bottom"]}>
      <StatusBar style="dark" backgroundColor={colors.background}/>
      <View style={styles.content}>
        {screen==="home"&&<HomeScreen onNavigate={setScreen}/>}
        {screen==="horoscope"&&<HoroscopeScreen/>}
        {screen==="panchang"&&<PanchangScreen/>}
        {screen==="discover"&&<ExploreScreen/>}
        {screen==="account"&&<AccountScreen/>}
        {screen === "numerology" && <NumerologyScreen onBack={()=>setScreen("home")}/>}
      </View>
      <View style={styles.navigation} accessibilityRole="tablist">
        {tabs.map(tab=>{
          const active=screen===tab.id||(screen==="numerology"&&tab.id==="home");
          return <Pressable
            key={tab.id} accessibilityRole="tab"
            accessibilityLabel={tab.label} accessibilityState={{selected:active}}
            onPress={()=>setScreen(tab.id)} style={[styles.navItem,active&&styles.navActive]}>
            <Text style={[styles.navIcon,active&&styles.activeText]}>{tab.symbol}</Text>
            <Text style={[styles.navLabel,active&&styles.activeText]} numberOfLines={1}>{tab.label}</Text>
          </Pressable>;
        })}
      </View>
    </SafeAreaView>
  </SafeAreaProvider>;
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.background},
  content:{flex:1},
  navigation:{flexDirection:"row",justifyContent:"space-around",borderTopColor:colors.border,borderTopWidth:1,
    backgroundColor:colors.surface,paddingHorizontal:3,paddingVertical:5},
  navItem:{flex:1,minHeight:54,alignItems:"center",justifyContent:"center",borderRadius:12,gap:1},
  navActive:{backgroundColor:colors.softGold},
  navIcon:{color:colors.muted,fontSize:21,fontWeight:"700"},
  navLabel:{color:colors.muted,fontSize:10,fontWeight:"700"},
  activeText:{color:colors.burgundy}
});
