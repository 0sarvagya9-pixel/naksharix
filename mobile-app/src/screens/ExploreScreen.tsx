import {useEffect,useState} from "react";
import {ActivityIndicator,Alert,Linking,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from "react-native";
import {getPublicData} from "../config/api";
import {webUrl} from "../config/env";
import {colors,sharedStyles as S} from "../ui/theme";
type Mode="shop"|"pujas"|"reports"|"calendar";
type CatalogItem={id:string;title:string;category:string;subtitle:string;pricePaise:number|null;path:string;
  bookingConfirmed?:false;purchaseInApp?:false;imageKind?:string};
type MobileCatalogue={shop:CatalogItem[];pujas:CatalogItem[];reports:CatalogItem[];
  meta:{disclaimer:string;checkout:string;shopStorageReady:boolean}};
type CalendarItem={id:string;date:string;name:string;bookingStatus:"information_only"};
type CalendarFeed={events:CalendarItem[];bookingAvailable:false;countryReference:string;note:string};
const tabs:ReadonlyArray<{id:Mode,label:string,icon:string}>=[
  {id:"shop",label:"Shop",icon:"◈"},
  {id:"pujas",label:"Puja",icon:"✦"},
  {id:"reports",label:"Reports",icon:"▤"},
  {id:"calendar",label:"Calendar",icon:"☼"}
];
function priceLabel(value:number|null){
  if(typeof value!=="number"||!Number.isFinite(value)||value<100)return "Price not published";
  return "Listed ₹"+(value/100).toLocaleString("en-IN",{maximumFractionDigits:2});
}
function openWebsite(path:string){
  try{
    Linking.openURL(webUrl(path)).catch(()=>Alert.alert("Open failed","Please try again with an internet connection."));
  }catch{Alert.alert("Invalid link","This catalogue destination is unavailable.");}
}
function todayIST(){return new Date(Date.now()+330*60000).toISOString().slice(0,10);}
export function ExploreScreen(){
  const [mode,setMode]=useState<Mode>("shop");
  const [search,setSearch]=useState("");
  const [catalog,setCatalog]=useState<MobileCatalogue|null>(null);
  const [calendar,setCalendar]=useState<CalendarItem[]|null>(null);
  const [loading,setLoading]=useState(true);
  const [calendarLoading,setCalendarLoading]=useState(false);
  const [error,setError]=useState("");
  const [calendarError,setCalendarError]=useState("");
  const [retry,setRetry]=useState(0);
  const [calendarRetry,setCalendarRetry]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);setError("");
    getPublicData<MobileCatalogue>("/api/mobile/catalogue",controller.signal)
      .then(data=>{
        if(controller.signal.aborted)return;
        if(!data||!Array.isArray(data.shop)||!Array.isArray(data.pujas)||!Array.isArray(data.reports))
          throw Error("Catalogue response is incomplete");
        setCatalog(data);setLoading(false);
      })
      .catch(e=>{if(!controller.signal.aborted){setLoading(false);setError(e instanceof Error?e.message:"Unavailable");}});
    return()=>controller.abort();
  },[retry]);
  useEffect(()=>{
    if(mode!=="calendar")return;
    const controller=new AbortController();
    setCalendarLoading(true);setCalendarError("");
    getPublicData<CalendarFeed>("/api/puja/calendar",controller.signal)
      .then(items=>{
        if(controller.signal.aborted)return;
        if(!items||!Array.isArray(items.events)||items.bookingAvailable!==false)throw Error("Calendar response is invalid");
        setCalendar(items.events.filter(item=>typeof item.date==="string"&&item.date>=todayIST())
          .sort((a,b)=>a.date.localeCompare(b.date)).slice(0,32));
        setCalendarLoading(false);
      })
      .catch(e=>{if(!controller.signal.aborted){setCalendarLoading(false);setCalendarError(e instanceof Error?e.message:"Unavailable");}});
    return()=>controller.abort();
  },[mode,calendarRetry]);
  const items=(catalog?.[mode==="calendar"?"shop":mode]||[])
    .filter(x=>x.title.toLowerCase().includes(search.trim().toLowerCase())||
               x.category.toLowerCase().includes(search.trim().toLowerCase()));
  return <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled">
    <Text style={S.eyebrow}>HANDPICKED EXPERIENCES</Text>
    <Text style={S.title}>Explore Naksharix</Text>
    <Text style={S.subtitle}>Browse published information in the app. Bookings, purchase and private reports use the protected website.</Text>
    <View style={styles.navRow}>
      {tabs.map(tab=><Pressable key={tab.id} accessibilityRole="button"
        accessibilityState={{selected:mode===tab.id}} style={[styles.navItem,mode===tab.id&&styles.active]}
        onPress={()=>{setMode(tab.id);setSearch("");}}>
        <Text style={[styles.navSymbol,mode===tab.id&&styles.activeText]}>{tab.icon}</Text>
        <Text style={[styles.navLabel,mode===tab.id&&styles.activeText]}>{tab.label}</Text>
      </Pressable>)}
    </View>
    {mode==="calendar"?<View style={{gap:12}}>
      <Text style={S.sectionTitle}>Upcoming observances</Text>
      <Text style={S.subtitle}>Curated reference dates for India. Local Panchang and regional customs may vary.</Text>
      {calendarLoading?<ActivityIndicator color={colors.burgundy} size="large"/>:
        calendarError?<View style={S.card}>
          <Text accessibilityRole="alert" style={styles.error}>{calendarError}</Text>
          <Pressable style={S.button} onPress={()=>setCalendarRetry(n=>n+1)}><Text style={S.buttonText}>Retry calendar</Text></Pressable>
        </View>:calendar?.length?calendar.map(item=><View key={item.id} style={styles.event}>
          <View style={styles.eventDay}><Text style={styles.eventDayText}>{item.date.slice(8,10)}</Text>
            <Text style={styles.eventMonth}>{item.date.slice(5,7)}/{item.date.slice(2,4)}</Text></View>
          <View style={{flex:1}}><Text style={S.cardTitle}>{item.name}</Text>
            <Text style={S.cardText}>Information only • no booking confirmed</Text></View>
        </View>):<Text style={S.cardText}>No upcoming dates are available in the current curated feed.</Text>}
      <Pressable style={S.mutedButton} onPress={()=>openWebsite("/puja-calendar")} accessibilityRole="link">
        <Text style={S.mutedButtonText}>More festival information  ↗</Text>
      </Pressable>
    </View>:<View style={{gap:12}}>
      <Text style={S.sectionTitle}>{mode==="shop"?"Spiritual catalogue":mode==="pujas"?"Puja traditions":"Personalized reports"}</Text>
      <TextInput placeholder="Search this collection" placeholderTextColor="#94828B" value={search}
        onChangeText={setSearch} style={styles.search} accessibilityLabel="Search catalogue"/>
      {loading?<View style={{padding:25,alignItems:"center",gap:12}}>
        <ActivityIndicator color={colors.burgundy}/><Text style={S.cardText}>Loading published catalogue...</Text>
      </View>:error?<View style={S.card}>
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
        <Pressable onPress={()=>setRetry(n=>n+1)} style={S.button}><Text style={S.buttonText}>Retry catalogue</Text></Pressable>
      </View>:items.length?items.map((item,index)=><View style={styles.item} key={mode+"-"+item.id}>
        <View style={styles.itemHeader}>
          <View style={styles.iconBox}><Text style={styles.symbol}>{mode==="shop"?"◈":mode==="reports"?"▤":"✦"}</Text></View>
          <View style={{flex:1}}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={S.cardTitle}>{item.title}</Text>
          </View>
        </View>
        <Text style={S.cardText}>{item.subtitle}</Text>
        <View style={styles.itemFoot}>
          <Text style={styles.price}>{priceLabel(item.pricePaise)}</Text>
          <Pressable accessibilityRole="link" accessibilityLabel={"View "+item.title}
            style={styles.detailButton} onPress={()=>openWebsite(item.path)}>
            <Text style={styles.detailText}>View details  ↗</Text>
          </Pressable>
        </View>
        {mode==="pujas"?<Text style={styles.note}>Priest and date availability are not confirmed.</Text>:null}
      </View>):<View style={S.card}><Text style={S.cardText}>No matching published items. Try another search.</Text></View>}
      <Pressable style={S.mutedButton} accessibilityRole="link"
        onPress={()=>openWebsite(mode==="shop"?"/shop":mode==="pujas"?"/pujas":"/reports")}>
        <Text style={S.mutedButtonText}>Open full {mode} catalogue  ↗</Text>
      </Pressable>
    </View>}
    <Text style={S.disclaimer}>Prices are listings, not proof of physical stock, expert availability or fulfilled services. No in-app payment or background purchase is performed.</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({
  navRow:{flexDirection:"row",gap:7,justifyContent:"space-between"},
  navItem:{flex:1,minHeight:69,borderWidth:1,borderColor:colors.border,borderRadius:13,
    backgroundColor:colors.surface,alignItems:"center",justifyContent:"center",gap:4,padding:6},
  active:{backgroundColor:colors.burgundy,borderColor:colors.burgundy},
  navSymbol:{color:colors.gold,fontSize:22,fontWeight:"900"},
  navLabel:{color:colors.ink,fontSize:11,fontWeight:"800"},
  activeText:{color:colors.white},
  search:{borderWidth:1,borderColor:colors.border,borderRadius:13,minHeight:48,
    paddingHorizontal:15,backgroundColor:colors.surface,color:colors.ink,fontSize:14},
  item:{borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,
    borderRadius:18,padding:16,gap:12},
  itemHeader:{flexDirection:"row",alignItems:"center",gap:13},
  iconBox:{height:53,width:53,borderRadius:15,backgroundColor:colors.softGold,alignItems:"center",justifyContent:"center"},
  symbol:{fontSize:27,color:colors.burgundy},
  category:{fontSize:10,fontWeight:"900",color:colors.gold,textTransform:"uppercase",letterSpacing:1,marginBottom:4},
  itemFoot:{flexDirection:"row",alignItems:"center",gap:7,justifyContent:"space-between"},
  price:{color:colors.burgundy,fontSize:12,fontWeight:"800",flexShrink:1},
  detailButton:{backgroundColor:colors.burgundy,paddingHorizontal:12,paddingVertical:11,borderRadius:10,
    minHeight:44,justifyContent:"center"},
  detailText:{color:colors.white,fontSize:12,fontWeight:"800"},
  note:{color:colors.muted,fontSize:11,fontStyle:"italic"},
  event:{flexDirection:"row",alignItems:"center",gap:14,borderWidth:1,borderColor:colors.border,
    backgroundColor:colors.surface,borderRadius:17,padding:14},
  eventDay:{width:58,padding:9,borderRadius:11,alignItems:"center",backgroundColor:colors.softGold},
  eventDayText:{fontSize:24,fontWeight:"900",color:colors.burgundy},
  eventMonth:{fontSize:11,color:colors.burgundy,fontWeight:"700"},
  error:{color:colors.error,fontSize:14,lineHeight:21}
});
