import {useEffect,useState} from "react";
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,View} from "react-native";
import {getPublicData} from "../config/api";
import {colors,sharedStyles as S} from "../ui/theme";

type Panchang={
  date:string;location:string;timezone:string;sunrise:string|null;sunset:string|null;
  moonrise:string|null;moonset:string|null;tithi:string;paksha:string;nakshatra:string;
  nakshatraPada:number;yoga:string;karana:string;vaar:string;rahuKaal:string|null;
  yamaganda:string|null;gulikaKaal:string|null;abhijitMuhurat:string|null;
  metadata:{verified:boolean;externalVerification:boolean;limitations:string[]};
};
const cities=[
  {name:"Delhi",lat:28.6139,lng:77.209},
  {name:"Mumbai",lat:19.076,lng:72.8777},
  {name:"Bhopal",lat:23.2599,lng:77.4126},
  {name:"Bengaluru",lat:12.9716,lng:77.5946},
  {name:"Kolkata",lat:22.5726,lng:88.3639},
  {name:"Chennai",lat:13.0827,lng:80.2707}
] as const;
function todayIndia(){
  return new Date(Date.now()+330*60000).toISOString().slice(0,10);
}
function moveDate(date:string,days:number){
  const d=new Date(date+"T12:00:00Z");
  d.setUTCDate(d.getUTCDate()+days);
  return d.toISOString().slice(0,10);
}
const core=(p:Panchang):ReadonlyArray<[string,string|number|null]>=>[
  ["Vaar",p.vaar],["Sunrise",p.sunrise],["Sunset",p.sunset],
  ["Tithi",p.tithi+" · "+p.paksha],["Nakshatra",p.nakshatra+" · Pada "+p.nakshatraPada],
  ["Yoga",p.yoga],["Karana",p.karana],["Moonrise",p.moonrise],["Moonset",p.moonset]
];
const timings=(p:Panchang):ReadonlyArray<[string,string|null]>=>[
  ["Rahu Kaal",p.rahuKaal],["Yamaganda",p.yamaganda],
  ["Gulika Kaal",p.gulikaKaal],["Abhijit Muhurat",p.abhijitMuhurat]
];

export function PanchangScreen(){
  const [index,setIndex]=useState(0);
  const [date,setDate]=useState(todayIndia);
  const [state,setState]=useState<{loading:boolean;data:Panchang|null;error:string}>({loading:true,data:null,error:""});
  const [retry,setRetry]=useState(0);
  const city=cities[index];
  useEffect(()=>{
    const controller=new AbortController();
    setState({loading:true,data:null,error:""});
    const query="/api/panchang?date="+encodeURIComponent(date)+"&latitude="+city.lat+
      "&longitude="+city.lng+"&timezone=%2B05%3A30&place="+encodeURIComponent(city.name+", India");
    getPublicData<{panchang:Panchang}>(query,controller.signal)
      .then(data=>{
        if(controller.signal.aborted)return;
        if(!data?.panchang||typeof data.panchang.tithi!=="string")
          throw Error("Panchang data is incomplete.");
        setState({loading:false,data:data.panchang,error:""});
      })
      .catch(error=>{if(!controller.signal.aborted)
        setState({loading:false,data:null,error:error instanceof Error?error.message:"Panchang unavailable"});});
    return()=>controller.abort();
  },[index,date,retry]);
  return <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
    <Text style={S.eyebrow}>YOUR TRADITIONAL CALENDAR</Text>
    <Text style={S.title}>Daily Panchang</Text>
    <Text style={S.subtitle}>Calculated for the selected Indian city and date. No device location permission needed.</Text>
    <Text style={S.cardTitle}>Choose your city</Text>
    <View style={styles.pills}>
      {cities.map((city,i)=><Pressable key={city.name} style={[S.pill,i===index&&S.pillSelected]}
        accessibilityRole="button" accessibilityState={{selected:i===index}} onPress={()=>setIndex(i)}>
        <Text style={[S.pillText,i===index&&S.pillTextSelected]}>{city.name}</Text>
      </Pressable>)}
    </View>
    <View style={styles.dateBar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Previous day"
        onPress={()=>setDate(d=>moveDate(d,-1))} style={styles.dayControl}><Text style={styles.dayGlyph}>‹</Text></Pressable>
      <Pressable onPress={()=>setDate(todayIndia())} accessibilityRole="button" style={{flex:1,alignItems:"center"}}>
        <Text style={styles.dateMain}>{date}</Text>
        <Text style={styles.dateHint}>Tap to return to today (IST)</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Next day"
        onPress={()=>setDate(d=>moveDate(d,1))} style={styles.dayControl}><Text style={styles.dayGlyph}>›</Text></Pressable>
    </View>
    {state.loading?<View style={styles.loading}><ActivityIndicator color={colors.burgundy} size="large"/>
      <Text style={S.cardText}>Calculating local solar and lunar details...</Text></View>:
    state.error?<View style={S.card}><Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
      <Pressable onPress={()=>setRetry(i=>i+1)} accessibilityRole="button" style={S.button}>
        <Text style={S.buttonText}>Try again</Text></Pressable></View>:
    state.data?<View style={{gap:13}}>
      <View style={[S.card,{backgroundColor:colors.softGold}]}>
        <Text style={S.eyebrow}>{state.data.location||city.name}</Text>
        <Text style={styles.highlight}>{state.data.tithi}</Text>
        <Text style={S.cardText}>{state.data.paksha}  •  {state.data.vaar}</Text>
      </View>
      <View style={S.card}>
        <Text style={S.sectionTitle}>Lunar calendar</Text>
        {core(state.data).map(([label,value])=><View style={styles.row} key={label}>
          <Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value??"Not available"}</Text></View>)}
      </View>
      <View style={S.card}>
        <Text style={S.sectionTitle}>Day's timings</Text>
        {timings(state.data).map(([label,value])=><View style={styles.row} key={label}>
          <Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value??"Not available"}</Text></View>)}
      </View>
    </View>:null}
    <Text style={S.disclaimer}>These calculations follow the Naksharix internal astronomical engine and have not been independently verified for exact ritual muhurat. Confirm local traditions and timings with a qualified practitioner before booking.</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({
  pills:{flexDirection:"row",flexWrap:"wrap",gap:7},
  dateBar:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:17,
    flexDirection:"row",alignItems:"center",padding:8,minHeight:72},
  dayControl:{height:50,width:50,justifyContent:"center",alignItems:"center",borderRadius:12,
    backgroundColor:colors.softGold},
  dayGlyph:{fontSize:28,fontWeight:"700",color:colors.burgundy},
  dateMain:{fontSize:18,fontWeight:"900",color:colors.ink},
  dateHint:{fontSize:11,marginTop:3,color:colors.muted},
  highlight:{fontSize:23,fontWeight:"900",color:colors.burgundy},
  row:{borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border,paddingVertical:9,
    flexDirection:"row",gap:10,justifyContent:"space-between"},
  rowLabel:{fontSize:13,color:colors.muted,flex:1},
  rowValue:{fontSize:13,color:colors.ink,flex:1,fontWeight:"700",textAlign:"right"},
  loading:{padding:35,alignItems:"center",gap:13},
  error:{color:colors.error,fontSize:13,lineHeight:20}
});
