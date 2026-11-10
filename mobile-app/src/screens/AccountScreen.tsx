import {useCallback,useEffect,useRef,useState} from "react";
import {ActivityIndicator,Alert,AppState,Linking,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from "react-native";
import {colors,sharedStyles as S} from "../ui/theme";
import {webUrl} from "../config/env";
import {MobileAuthError,deleteAccessToken,mobileRequest,savedAccessToken,saveAccessToken} from "../auth/mobile-session";

type Profile={id:string;name:string;email:string;phone:string|null;locale:string;
  dob:string|null;birthPlace:string|null;createdAt:string};
type RecordRow={id:string;name?:string;title?:string;reportSlug?:string;topicId?:string;
  zodiac?:string;period?:string;spread?:string;lifePathNumber?:number;
  purpose?:string;status?:string;paymentStatus?:string;deliveryStatus?:string;
  createdAt?:string;preferredDate?:string;scheduledAt?:string;trackingReference?:string};
type Section="kundlis"|"kundliReports"|"numerologyReports"|"horoscopeHistory"|"tarotReadings"|"reportRequests"|"purchasedReports"|"shopOrders"|
  "pujaBookings"|"consultations"|"payments"|"appointments";
type History=Record<Section,RecordRow[]>;
type Account={profile:Profile;history:History;meta:{userId:string;source:string}};
type Pair={deviceCode:string;approvalUrl:string;expiresInSeconds:number;intervalSeconds:number};
type Poll={state:"pending"|"expired"|"linked";accessToken?:string};
const groups:ReadonlyArray<{key:Section;title:string;url:string}>=[
  {key:"kundlis",title:"Kundli",url:"/my-readings"},
  {key:"kundliReports",title:"Saved Reports",url:"/saved-reports"},
  {key:"numerologyReports",title:"Numerology",url:"/numerology"},
  {key:"horoscopeHistory",title:"Horoscope",url:"/horoscope"},
  {key:"tarotReadings",title:"Tarot",url:"/tarot"},
  {key:"reportRequests",title:"Report Requests",url:"/profile"},
  {key:"purchasedReports",title:"Purchased Reports",url:"/saved-reports"},
  {key:"shopOrders",title:"Shop Orders",url:"/profile"},
  {key:"pujaBookings",title:"Puja Requests",url:"/profile"},
  {key:"consultations",title:"Consultations",url:"/consultation"},
  {key:"payments",title:"Payments",url:"/dashboard"},
  {key:"appointments",title:"Appointments",url:"/dashboard"}
];
function open(path:string){
  Linking.openURL(webUrl(path)).catch(()=>Alert.alert("Link unavailable","Try again with a network connection."));
}
function dateLabel(row:RecordRow){
  const d=new Date(row.scheduledAt||row.preferredDate||row.createdAt||"");
  return Number.isNaN(d.getTime())?"":d.toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"});
}
export function AccountScreen(){
  const mounted=useRef(true),tokenRef=useRef<string|null>(null);
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
  const [account,setAccount]=useState<Account|null>(null),[pair,setPair]=useState<Pair|null>(null);
  const [error,setError]=useState(""),[name,setName]=useState(""),[locale,setLocale]=useState("en");
  const [section,setSection]=useState<Section>("kundlis");
  const [older,setOlder]=useState<Partial<History>>({});
  const [nextPage,setNextPage]=useState<Partial<Record<Section,number|null>>>({});
  const load=useCallback(async(token:string)=>{
    const result=await mobileRequest<Account>("/api/mobile/account",{token});
    if(!mounted.current)return;
    if(!result.profile||!result.history||result.profile.id!==result.meta.userId)
      throw Error("The shared account response was incomplete.");
    setAccount(result);setOlder({});setNextPage({});
    setName(result.profile.name);setLocale(result.profile.locale);setError("");
  },[]);
  useEffect(()=>{
    mounted.current=true;
    savedAccessToken().then(async token=>{
      if(!mounted.current)return;
      if(token){
        tokenRef.current=token;
        try{await load(token);}
        catch(e){
          if(!mounted.current)return;
          if(e instanceof MobileAuthError&&e.status===401){
            await deleteAccessToken();tokenRef.current=null;
          }
          setError(e instanceof Error?e.message:"Account unavailable");
        }
      }
    }).catch(()=>{if(mounted.current)setError("Could not restore mobile session.");})
      .finally(()=>{if(mounted.current)setLoading(false);});
    return()=>{mounted.current=false;};
  },[load]);
  useEffect(()=>{
    if(!pair)return;
    let active=true,inFlight=false;
    const expiresAt=Date.now()+pair.expiresInSeconds*1000;
    const poll=async()=>{
      if(!active||inFlight)return;
      if(Date.now()>expiresAt){setPair(null);setError("Connection expired. Start again.");return;}
      inFlight=true;
      try{
        const result=await mobileRequest<Poll>("/api/mobile/auth/poll",{
          method:"POST",body:{deviceCode:pair.deviceCode}});
        if(!active||!mounted.current)return;
        if(result.state==="expired"){setPair(null);setError("Connection expired.");}
        if(result.state==="linked"&&result.accessToken){
          await saveAccessToken(result.accessToken);
          tokenRef.current=result.accessToken;
          await load(result.accessToken);
          if(active)setPair(null);
        }
      }catch(e){if(active&&mounted.current)setError(e instanceof Error?e.message:"Waiting for approval");}
      finally{inFlight=false;}
    };
    void poll();
    const timer=setInterval(()=>{void poll();},3500);
    const sub=AppState.addEventListener("change",s=>{if(s==="active")void poll();});
    return()=>{active=false;clearInterval(timer);sub.remove();};
  },[pair,load]);
  async function connect(){
    if(pair||busy)return;
    setBusy(true);setError("");
    try{
      const response=await mobileRequest<Pair>("/api/mobile/auth/start",{method:"POST",body:{}});
      if(!response.deviceCode||!response.approvalUrl.startsWith("https://www.naksharix.com/mobile/link?"))
        throw Error("Invalid secure login destination.");
      setPair(response);
      await Linking.openURL(response.approvalUrl);
    }catch(e){setPair(null);setError(e instanceof Error?e.message:"Cannot connect");}
    finally{setBusy(false);}
  }
  async function refresh(){
    if(!tokenRef.current||busy)return;
    setBusy(true);
    try{await load(tokenRef.current);}catch(e){setError(e instanceof Error?e.message:"Unable to refresh");}
    finally{setBusy(false);}
  }
  async function saveProfile(){
    if(!tokenRef.current||busy)return;
    setBusy(true);
    try{
      await mobileRequest("/api/mobile/account",{method:"PATCH",token:tokenRef.current,
        body:{name:name.trim(),locale}});
      await load(tokenRef.current);
    }catch(e){setError(e instanceof Error?e.message:"Not saved");}
    finally{setBusy(false);}
  }
  async function loadOlder(){
    if(!account||!tokenRef.current||busy)return;
    const index=nextPage[section]===undefined?1:nextPage[section];
    if(index===null)return;
    setBusy(true);
    try{
      const result=await mobileRequest<{records:RecordRow[];nextPage:number|null}>(
        "/api/mobile/account/history?section="+section+"&page="+index,{token:tokenRef.current});
      setOlder(p=>({...p,[section]:[...(p[section]||[]),...result.records]}));
      setNextPage(p=>({...p,[section]:result.nextPage}));setError("");
    }catch(e){setError(e instanceof Error?e.message:"Older records unavailable");}
    finally{setBusy(false);}
  }
  async function signOut(){
    const token=tokenRef.current;tokenRef.current=null;setBusy(true);
    try{if(token)await mobileRequest("/api/mobile/auth/logout",{method:"POST",body:{},token});}
    catch{/* local key is still removed and server token expires independently */}
    finally{await deleteAccessToken().catch(()=>{});setAccount(null);setPair(null);setError("");setBusy(false);}
  }
  if(loading)return <View style={styles.loading}><ActivityIndicator color={colors.burgundy}/>
    <Text style={S.cardText}>Loading your secure account...</Text></View>;
  const records=[...(account?.history[section]||[]),...(older[section]||[])];
  return <ScrollView contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled">
    <Text style={S.eyebrow}>WEBSITE + ANDROID • ONE ACCOUNT</Text>
    <Text style={S.title}>Your Naksharix</Text>
    <Text style={S.subtitle}>Your profile, bookings and saved history come from the same website database.</Text>
    {!account?<View style={[S.card,{backgroundColor:colors.softGold}]}>
      <Text style={S.cardTitle}>Connect your existing website account</Text>
      <Text style={S.cardText}>Use your Google or email login in the official browser and approve this phone.
        Your website password and cookies never enter the Android app.</Text>
      {pair?<View style={{gap:12}}>
        <Text style={S.cardText}>Waiting for approval. Return here after approving in the browser.</Text>
        <Pressable style={S.mutedButton} onPress={()=>Linking.openURL(pair.approvalUrl)}>
          <Text style={S.mutedButtonText}>Reopen approval page ↗</Text></Pressable>
        <Pressable style={S.mutedButton} onPress={()=>setPair(null)}>
          <Text style={S.mutedButtonText}>Cancel</Text></Pressable>
      </View>:<Pressable style={S.button} onPress={connect} disabled={busy}>
        <Text style={S.buttonText}>Connect my website account ↗</Text></Pressable>}
    </View>:<>
      <View style={[S.card,{backgroundColor:colors.softGold}]}>
        <Text style={S.eyebrow}>CONNECTED</Text>
        <Text style={styles.accountName}>{account.profile.name}</Text>
        <Text style={S.cardText}>{account.profile.email}</Text>
      </View>
      <View style={S.card}>
        <Text style={S.sectionTitle}>Profile details</Text>
        <Text style={S.cardText}>Name and language changes sync with the website.</Text>
        <TextInput accessibilityLabel="Your display name" value={name} onChangeText={setName}
          maxLength={80} autoCapitalize="words" style={styles.input}/>
        <View style={styles.group}>
          {(["en","hi","hinglish"] as const).map(l=><Pressable key={l}
            onPress={()=>setLocale(l)} style={[S.pill,locale===l&&S.pillSelected]}>
            <Text style={[S.pillText,locale===l&&S.pillTextSelected]}>
              {l==="en"?"English":l==="hi"?"Hindi":"Hinglish"}
            </Text></Pressable>)}
        </View>
        {account.profile.birthPlace?<Text style={S.cardText}>Saved birth place: {account.profile.birthPlace}</Text>:null}
        <Pressable style={S.button} disabled={busy||name.trim().length<2} onPress={saveProfile}>
          <Text style={S.buttonText}>Save to website account</Text></Pressable>
      </View>
      <View style={S.card}>
        <View style={styles.headingRow}><Text style={S.sectionTitle}>Your history</Text>
          <Pressable style={S.mutedButton} disabled={busy} onPress={refresh}>
            <Text style={S.mutedButtonText}>Refresh</Text></Pressable></View>
        <View style={styles.group}>{groups.map(item=><Pressable key={item.key}
          onPress={()=>setSection(item.key)} style={[styles.historyTab,section===item.key&&S.pillSelected]}>
          <Text style={[styles.tabText,section===item.key&&{color:colors.white}]}>
            {item.title} ({account.history[item.key].length+(older[item.key]?.length||0)})
          </Text></Pressable>)}</View>
        {records.length===0?<Text style={S.cardText}>No records saved under this account yet.</Text>:
          records.map(row=><View key={row.id} style={styles.historyItem}>
            <Text style={S.cardTitle}>{row.name||row.title||row.reportSlug||row.topicId||row.purpose||(row.zodiac?row.zodiac+" "+(row.period||"horoscope"):"")||row.spread||"Saved record"}</Text>
            <Text style={S.cardText}>{row.status||row.paymentStatus||row.deliveryStatus||"Saved"}
              {dateLabel(row)?" · "+dateLabel(row):""}{row.lifePathNumber!==undefined?" · Life path "+row.lifePathNumber:""}</Text>
            {row.trackingReference?<Text style={S.cardText}>Tracking: {row.trackingReference}</Text>:null}
          </View>)}
        {account.history[section].length===30&&nextPage[section]!==null?
          <Pressable style={S.mutedButton} disabled={busy} onPress={loadOlder}>
            <Text style={S.mutedButtonText}>{busy?"Loading...":"Load older history"}</Text></Pressable>:null}
        <Pressable style={S.mutedButton} onPress={()=>open(groups.find(g=>g.key===section)?.url||"/dashboard")}>
          <Text style={S.mutedButtonText}>Open detailed records on website ↗</Text></Pressable>
      </View>
      <Pressable style={S.mutedButton} onPress={signOut} disabled={busy}>
        <Text style={S.mutedButtonText}>Disconnect this Android device</Text></Pressable>
    </>}
    {error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}
    <Text style={S.disclaimer}>Only records linked to this verified user ID appear.
      Guest records are never claimed by matching email. Sensitive downloads and payment details stay on the secure website.</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({
  loading:{flex:1,justifyContent:"center",alignItems:"center",gap:15},
  accountName:{fontSize:23,fontWeight:"900",color:colors.ink},
  input:{minHeight:49,borderWidth:1,borderColor:colors.border,borderRadius:12,
    paddingHorizontal:13,backgroundColor:colors.background,color:colors.ink,fontSize:15},
  group:{flexDirection:"row",flexWrap:"wrap",gap:7},
  headingRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  historyTab:{borderWidth:1,borderColor:colors.border,padding:10,borderRadius:11,minHeight:42},
  tabText:{fontSize:11,color:colors.ink,fontWeight:"800"},
  historyItem:{paddingVertical:12,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border},
  error:{color:colors.error,fontSize:13,fontWeight:"700"}
});
