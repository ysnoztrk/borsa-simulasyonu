import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    onSnapshot,
    writeBatch,
    query,
    updateDoc,
    addDoc,
    orderBy,
    deleteDoc,
    Timestamp
} from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCBE4bg19z6BUm-L4LdHDwu2jg7aFsGM8s",
  authDomain: "borsasimulasyonu-7e5a7.firebaseapp.com",
  projectId: "borsasimulasyonu-7e5a7",
  storageBucket: "borsasimulasyonu-7e5a7.firebasestorage.app",
  messagingSenderId: "179311731489",
  appId: "1:179311731489:web:61727eb1b469a29316d460"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/> <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/> </svg> );

const styles = {
  container: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', flex: 1, backgroundColor: '#121212', color: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, display: 'flex', flexDirection: 'column', height: '100vh' },
  authTitle: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginBottom: 40, },
  input: { width: '100%', maxWidth: '400px', backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, color: '#FFF', marginBottom: 15, border: '1px solid #333', fontSize: '16px', boxSizing: 'border-box', },
  button: { width: '100%', maxWidth: '400px', backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, border: 'none', color: '#FFF', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', },
  switchText: { color: '#007bff', marginTop: 20, cursor: 'pointer', },
  header: { padding: '15px 20px', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' },
  headerText: { color: '#aaa', fontSize: 14, margin: 0, },
  balanceText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', margin: '4px 0', },
  subBalanceText:{ color: '#aaa', fontSize: 14, margin: 0, },
  logoutText: { color: '#dc3545', fontSize: 14, cursor: 'pointer', marginLeft: 15 },
  marketStatusContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px', },
  marketStatusIndicator: { width: '10px', height: '10px', borderRadius: '5px', },
  marketOpen: { backgroundColor: '#28a745', },
  marketClosed: { backgroundColor: '#dc3545', },
  marketStatusText: { fontSize: '12px', fontWeight: 'bold', },
  overrideButton: { backgroundColor: '#444', color: '#fff', border: '1px solid #666', borderRadius: '5px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', },
  contentArea: { flex: 1, overflowY: 'auto', paddingBottom: '60px' },
  navBar: { display: 'flex', flexDirection: 'row', height: 60, backgroundColor: '#1e1e1e', borderTop: '1px solid #333', position: 'fixed', bottom: 0, width: '100%' },
  navButton: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: 'none', border: 'none' },
  navText: { color: '#888', fontSize: 14, },
  navTextActive: { color: '#007bff', fontWeight: 'bold', },
  stockRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #1e1e1e', cursor: 'pointer', },
  stockInfo: { flex: 2, },
  stockTicker: { fontSize: 16, fontWeight: 'bold', color: '#FFF', margin: 0, },
  stockName: { fontSize: 12, color: '#888', margin: 0, },
  stockPriceContainer: { flex: 1.5, textAlign: 'right', },
  stockPrice: { fontSize: 16, color: '#FFF', margin: 0, },
  stockChange: { fontSize: 12, },
  priceUp: { color: '#28a745', },
  priceDown: { color: '#dc3545', },
  stockActions: { flex: 1.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', },
  tradeButton: { padding: '8px 12px', borderRadius: 5, marginLeft: 5, border: 'none', color: '#FFF', fontWeight: 'bold', cursor: 'pointer', fontSize: 12 },
  tradeButtonDisabled: { backgroundColor: '#555', cursor: 'not-allowed', },
  buyButton: { backgroundColor: '#28a745' },
  sellButton: { backgroundColor: '#dc3545' },
  centerMessage: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' },
  centerMessageText: { color: '#888', fontSize: 16, },
  portfolioRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', padding: 20, margin: '10px 15px', borderRadius: 10, },
  newsCard: { position: 'relative', backgroundColor: '#1e1e1e', padding: 15, margin: '10px 15px', borderRadius: 10, },
  newsTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 5, margin: 0, },
  newsContent: { fontSize: 13, color: '#ccc', marginBottom: 10, margin: '5px 0 10px 0', },
  newsDate: { fontSize: 11, color: '#888', textAlign: 'right', },
  deleteButton: { position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#888', cursor: 'pointer', },
  newsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px', },
  secondaryButton: { backgroundColor: '#333', padding: '8px 15px', borderRadius: 8, color: '#FFF', fontSize: 12, cursor: 'pointer', border: '1px solid #555' },
  addNewsButton: { backgroundColor: '#007bff', padding: 10, margin: 15, borderRadius: 8, textAlign: 'center', color: '#FFF', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, },
  modalView: { width: '90%', maxWidth: '400px', backgroundColor: '#1e1e1e', borderRadius: 20, padding: 25, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.25)', },
  columnsModalView: { width: '90%', maxWidth: '700px', height: '80vh', backgroundColor: '#2a2a2a', borderRadius: 20, padding: 25, display: 'flex', flexDirection: 'column', },
  detailModalView: { width: '90%', maxWidth: '800px', backgroundColor: '#2a2a2a', borderRadius: 20, padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', },
  modalText: { marginBottom: 15, textAlign: 'center', color: '#FFF', fontSize: 16, },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 15, textAlign: 'center', },
  modalInfo: { fontSize: 14, color: '#aaa', marginBottom: 5, },
  modalButtonContainer: { display: 'flex', flexDirection: 'row', marginTop: 20, width: '100%', },
  modalButton: { flex: 1, borderRadius: 10, padding: 12, margin: '0 5px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  chartContainer: { width: '100%', height: '250px', marginTop: '20px', },
  timeRangeContainer: { display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '20px', flexWrap: 'wrap', },
  timeRangeButton: { background: '#333', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: 12 },
  timeRangeButtonActive: { background: '#007bff', },
  stockEffectTitle: { fontSize: 16, fontWeight: 'bold', color: '#ccc', marginTop: 20, marginBottom: 10, borderTop: '1px solid #444', paddingTop: 15, textAlign: 'center', },
  effectsContainer: { maxHeight: '150px', overflowY: 'auto', width: '100%', paddingRight: '10px' },
  effectRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', width: '100%', },
  effectInput: { width: '60px', backgroundColor: '#333', border: '1px solid #555', color: '#fff', padding: '5px', borderRadius: '5px', textAlign: 'right', }
};

const FOUNDER_EMAIL = 'kurucu@borsa.sim';
// Initial data (sadece boşsa kullanılır)
const INITIAL_COMPANIES = [
    { name: 'TeknoDev A.Ş.', ticker: 'TKNDV', price: 150.75, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
    { name: 'Gelecek Gıda Ltd.', ticker: 'GLCGD', price: 75.50, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
    { name: 'Enerji Çözümleri A.Ş.', ticker: 'ENRCS', price: 210.00, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
    { name: 'Sağlık Grubu Global', ticker: 'SGLBL', price: 320.40, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
    { name: 'Otomotiv Lideri A.Ş.', ticker: 'OTLDR', price: 450.60, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
    { name: 'Bulut Bilişim Tech', ticker: 'BLTBL', price: 620.00, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
    { name: 'Yeşil Tarım A.Ş.', ticker: 'YSTRM', price: 95.20, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
    { name: 'Perakende Zinciri A.Ş.', ticker: 'PRKND', price: 180.90, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
    { name: 'İnşaat Holding', ticker: 'INSHL', price: 112.30, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
    { name: 'Turizm ve Otelcilik', ticker: 'TRZMO', price: 250.00, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0 },
];
const INITIAL_FOREX = [
    { name: 'Amerikan Doları', ticker: 'USD', price: 34.20, change: 0, lastChangePercent: 0 },
    { name: 'Euro', ticker: 'EUR', price: 36.80, change: 0, lastChangePercent: 0 },
    { name: 'Gram Altın', ticker: 'XAU', price: 2500.00, change: 0, lastChangePercent: 0 },
];
const INITIAL_NEWS = [
  { title: 'TeknoDev Yeni Bir Yapay Zeka Modeli Duyurdu!', content: 'TeknoDev A.Ş., bugün düzenlediği basın toplantısıyla verimliliği %40 artıracak yeni nesil yapay zeka modelini tanıttı.', date: new Date().toISOString() },
];
const INITIAL_COLUMNS = [
    { title: 'Piyasalarda Yapay Zeka Rüzgarı', content: 'Son dönemde teknoloji hisselerinde yaşanan yükseliş, yapay zeka alanındaki gelişmelerle doğrudan ilişkili...', author: 'Ahmet Yılmaz', date: new Date().toISOString() }
];

const mulberry32 = (a) => {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
};

// Grafik için Basit Veri Üretici
const generateConsistentHistoricalData = (ticker, currentPrice, range) => {
    let seed = 0;
    for (let i = 0; i < ticker.length; i++) seed += ticker.charCodeAt(i);
    const random = mulberry32(seed);

    let data = [];
    let labels = [];
    let points, interval;
    const now = new Date();

    switch (range) {
        case '1A': points = 30; interval = 24 * 60 * 60 * 1000; break;
        case '3A': points = 12; interval = 7 * 24 * 60 * 60 * 1000; break;
        case '1Y': points = 12; interval = 30.44 * 24 * 60 * 60 * 1000; break;
        case '2Y': points = 24; interval = 30.44 * 24 * 60 * 60 * 1000; break;
        case '5Y': points = 60; interval = 30.44 * 24 * 60 * 60 * 1000; break;
        default: points = 30; interval = 24 * 60 * 60 * 1000;
    }

    let price = currentPrice * (0.8 + random() * 0.4);
    for (let i = 0; i < points; i++) {
        const date = new Date(now.getTime() - ((points - 1 - i) * interval));
        labels.push(date.toLocaleDateString('tr-TR'));
        if (i > 0) price *= (1 + (random() - 0.5) * 0.15);
        data.push(parseFloat(price.toFixed(2)));
    }
    const adjustment = currentPrice / data[data.length - 1];
    data = data.map(p => parseFloat((p * adjustment).toFixed(2)));
    return { labels, data };
};

export default function App() {
  const [user, setUser] = useState(undefined);
  const [screen, setScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('piyasa');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [companies, setCompanies] = useState([]);
  const [forex, setForex] = useState([]);
  
  const [news, setNews] = useState([]);
  const [columns, setColumns] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tradeAction, setTradeAction] = useState('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [addNewsModalVisible, setAddNewsModalVisible] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newsEffects, setNewsEffects] = useState({});
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStockForDetail, setSelectedStockForDetail] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartTimeRange, setChartTimeRange] = useState('1A');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [columnsModalVisible, setColumnsModalVisible] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnAuthor, setNewColumnAuthor] = useState('');
  const [newColumnContent, setNewColumnContent] = useState('');
  
  const [marketStatus, setMarketStatus] = useState({
      isScheduledOpen: false, manualOverride: null, volatility: 0.04, overrideExpiry: null,
  });
  
  const isMarketOpen = marketStatus.manualOverride !== null ? marketStatus.manualOverride : marketStatus.isScheduledOpen;

  // 1. Auth Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.email);
        const unsubscribeUser = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: authUser.uid, ...docSnap.data() });
          } else {
             if (authUser.email === FOUNDER_EMAIL) {
                 await setDoc(userDocRef, { email: authUser.email, balance: 1000000, portfolio: {}, isFounder: true });
             } else { signOut(auth); }
          }
        });
        return () => unsubscribeUser();
      } else { setUser(null); }
    });
    return () => unsubAuth();
  }, []);

  // 2. Data Listeners (SADECE VERİYİ ALIR, ANİMASYON YAPMAZ)
  useEffect(() => {
    if (!user) return;

    const checkAndCreateInitialData = async () => {
        if (user.isFounder) {
             const marketStatusDocRef = doc(db, 'status', 'market');
             const marketSnap = await getDoc(marketStatusDocRef);
             if (!marketSnap.exists()) {
               await setDoc(marketStatusDocRef, { isScheduledOpen: false, manualOverride: null, volatility: 0.04, overrideExpiry: null });
             }
        }
    };
    checkAndCreateInitialData();

    // Veri değiştiğinde direkt state'e yaz. Animasyon yok.
    const unsubCompanies = onSnapshot(query(collection(db, 'marketData')), (snapshot) => {
        setCompanies(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, ticker: doc.id })));
        
        // Veri boşsa başlangıç verisini yükle (Sadece kurucu)
        if (snapshot.empty && user.isFounder) {
            const batch = writeBatch(db);
            INITIAL_COMPANIES.forEach(asset => batch.set(doc(db, 'marketData', asset.ticker), asset));
            batch.commit();
        }
    });

    const unsubForex = onSnapshot(query(collection(db, 'forexData')), (snapshot) => {
        setForex(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, ticker: doc.id })));
        
        if (snapshot.empty && user.isFounder) {
            const batch = writeBatch(db);
            INITIAL_FOREX.forEach(asset => batch.set(doc(db, 'forexData', asset.ticker), asset));
            batch.commit();
        }
    });
    
    const unsubNews = onSnapshot(query(collection(db, 'news'), orderBy('date', 'desc')), (snapshot) => {
        setNews(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const unsubColumns = onSnapshot(query(collection(db, 'columns'), orderBy('date', 'desc')), (snapshot) => {
        setColumns(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const unsubMarket = onSnapshot(doc(db, 'status', 'market'), (docSnap) => {
        if (docSnap.exists()) { 
            const data = docSnap.data();
            if (data.overrideExpiry && data.overrideExpiry.toDate) {
                data.overrideExpiry = data.overrideExpiry.toDate();
            }
            setMarketStatus(data); 
        }
    });

    return () => { 
        unsubCompanies(); 
        unsubForex();
        unsubNews(); 
        unsubColumns();
        unsubMarket(); 
    };
  }, [user]);


  const showModal = (message) => { setModalMessage(message); setModalVisible(true); };
  
  const handleRegister = async () => {
      if (!email || !password || !confirmPassword) { showModal("Lütfen tüm alanları doldurun."); return; }
      if (password !== confirmPassword) { showModal("Şifreler eşleşmiyor."); return; }
      if (email === FOUNDER_EMAIL) { showModal('Bu e-posta adresi kurucuya aittir. Giriş yapmayı deneyin.'); return; }
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, 'users', userCredential.user.email), { email: userCredential.user.email, balance: 100000, portfolio: {}, isFounder: false });
      } catch (error) { showModal("Kayıt başarısız: " + error.message); }
  };
  
  const handleLogin = async () => {
      if (!email || !password) { showModal("E-posta ve şifre girin."); return; }
      try { await signInWithEmailAndPassword(auth, email, password); } 
      catch (error) { showModal("Giriş başarısız: " + error.message); }
  };
  
  const handleLogout = () => { signOut(auth); };
  
  const openTradeModal = (asset, action) => {
      const officialAsset = [...companies, ...forex].find(a => a.ticker === asset.ticker);
      setSelectedAsset(officialAsset); 
      setTradeAction(action); 
      setTradeModalVisible(true); 
      setTradeAmount(''); 
  };
  
  const executeTrade = async () => {
      const amount = parseFloat(tradeAmount);
      if(isNaN(amount) || amount <= 0) { showModal("Geçerli bir miktar girin."); return; }
      const totalCost = selectedAsset.price * amount;
      const userDocRef = doc(db, "users", user.email);

      if (tradeAction === 'buy') {
          if (user.balance < totalCost) { showModal('Yetersiz bakiye!'); return; }
          const newBalance = user.balance - totalCost;
          const newPortfolio = { ...user.portfolio };
          newPortfolio[selectedAsset.ticker] = (newPortfolio[selectedAsset.ticker] || 0) + amount;
          await updateDoc(userDocRef, { balance: newBalance, portfolio: newPortfolio });
      } else {
          const currentAmount = user.portfolio[selectedAsset.ticker] || 0;
          if (currentAmount < amount) { showModal('Yetersiz varlık!'); return; }
          const newBalance = user.balance + totalCost;
          const newPortfolio = { ...user.portfolio };
          newPortfolio[selectedAsset.ticker] -= amount;
          if (newPortfolio[selectedAsset.ticker] <= 0.00001) { delete newPortfolio[selectedAsset.ticker]; }
          await updateDoc(userDocRef, { balance: newBalance, portfolio: newPortfolio });
      }
      setTradeModalVisible(false);
      showModal("İşlem başarılı!");
  };
  
  const handleAddNews = async () => {
      if (!newNewsTitle || !newNewsContent) { showModal('Haber başlığı ve içeriği boş bırakılamaz.'); return; }
      await addDoc(collection(db, 'news'), { title: newNewsTitle, content: newNewsContent, date: new Date().toISOString() });
      const batch = writeBatch(db);
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
      companies.forEach(company => {
          const effect = newsEffects[company.ticker];
          if (effect && !isNaN(effect)) {
              const target = company.price * (1 + effect / 100);
              const companyRef = doc(db, 'marketData', company.ticker);
              batch.update(companyRef, { targetPrice: Math.max(1, target), effectExpiry: Timestamp.fromMillis(expiryTime) });
          }
      });
      await batch.commit();
      setAddNewsModalVisible(false); setNewNewsTitle(''); setNewNewsContent(''); setNewsEffects({});
      showModal("Haber başarıyla yayınlandı ve piyasa etkileri ayarlandı.");
  };

  const handleDeleteNews = async (id) => { await deleteDoc(doc(db, 'news', id)); };
  
  const handleAddColumn = async () => {
    if (!newColumnTitle || !newColumnContent || !newColumnAuthor) { showModal("Tüm alanları doldurun."); return; }
    await addDoc(collection(db, 'columns'), { title: newColumnTitle, content: newColumnContent, author: newColumnAuthor, date: new Date().toISOString() });
    setNewColumnTitle(''); setNewColumnContent(''); setNewColumnAuthor('');
  };
  
  const handleDeleteColumn = async (id) => { await deleteDoc(doc(db, 'columns', id)); };

  const handleMarketOverrideToggle = async () => {
      try {
        const marketStatusRef = doc(db, 'status', 'market');
        let nextState;
        if (isMarketOpen) nextState = false; // Kapat
        else nextState = true; // Aç

        // Doküman yoksa oluşturarak güncelle (setDoc merge: true)
        if (nextState === true) {
             const now = new Date();
             const newExpiryDate = new Date();
             newExpiryDate.setHours(21, 0, 0, 0); 
             if (now.getHours() >= 21) newExpiryDate.setDate(newExpiryDate.getDate() + 1);
             
             await setDoc(marketStatusRef, { manualOverride: true, overrideExpiry: Timestamp.fromDate(newExpiryDate) }, { merge: true });
        } else {
             await setDoc(marketStatusRef, { manualOverride: false, overrideExpiry: null }, { merge: true });
        }
      } catch (err) {
          console.error("Piyasa durumu değiştirilemedi:", err);
          showModal("Piyasa durumu değiştirilirken hata oluştu.");
      }
  };
  
  const handleTimeRangeChange = async (ticker, currentPrice, range) => { 
      setIsChartLoading(true);
      setChartTimeRange(range); 
      let history = { labels: [], data: [] };
      history = generateConsistentHistoricalData(ticker, currentPrice, range);
      setChartData({ 
          labels: history.labels, 
          datasets: [{ label: 'Fiyat (₺)', data: history.data, borderColor: 'rgb(0, 123, 255)', backgroundColor: 'rgba(0, 123, 255, 0.1)', fill: true, tension: 0.1, pointRadius: 0 }] 
      }); 
      setIsChartLoading(false);
  };

  const handleStockClick = (asset) => { 
      const officialAsset = [...companies, ...forex].find(a => a.ticker === asset.ticker);
      if(!officialAsset) return;
      setSelectedStockForDetail(officialAsset); 
      setChartTimeRange('1A');
      handleTimeRangeChange(officialAsset.ticker, officialAsset.price, '1A');
      setDetailModalVisible(true); 
  };

  const renderAuthScreens = () => ( 
    <div style={styles.authContainer}> 
        <h1 style={styles.authTitle}>Borsa Simülasyonu</h1> 
        <input style={styles.input} placeholder="E-posta Adresi" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /> 
        <input style={styles.input} placeholder="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /> 
        {screen === 'register' && ( <input style={styles.input} placeholder="Şifre Tekrar" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /> )} 
        <button style={styles.button} onClick={screen === 'login' ? handleLogin : handleRegister}> {screen === 'login' ? 'Giriş Yap' : 'Kayıt Ol'} </button> 
        <p style={styles.switchText} onClick={() => setScreen(screen === 'login' ? 'register' : 'login')}> {screen === 'login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'} </p> 
        <p style={{marginTop: 30, color: '#666', fontSize: 12}}>Kurucu Girişi: kurucu@borsa.sim (Şifrenizi siz belirleyin)</p>
    </div> 
  );

  const AssetRow = ({ asset }) => {
    // Sadece veritabanından gelen veriyi göster
    const changeAmount = asset.change || 0;
    const prevPrice = asset.price - changeAmount;
    const percentageChange = prevPrice !== 0 ? (changeAmount / prevPrice) * 100 : 0;
    const priceChangeStyle = changeAmount >= 0 ? styles.priceUp : styles.priceDown;
    const tradeButtonsDisabled = !isMarketOpen;

    return ( <div key={asset.ticker} style={styles.stockRow} onClick={() => handleStockClick(asset)}> <div style={styles.stockInfo}> <p style={styles.stockTicker}>{asset.ticker}</p> <p style={styles.stockName}>{asset.name}</p> </div> <div style={styles.stockPriceContainer}> <p style={styles.stockPrice}>₺{asset.price.toFixed(2)}</p> <span style={{ ...styles.stockChange, ...priceChangeStyle }}> {percentageChange.toFixed(2)}% </span> </div> <div style={styles.stockActions}> <button disabled={tradeButtonsDisabled} style={{...styles.tradeButton, ...styles.buyButton, ...(tradeButtonsDisabled && styles.tradeButtonDisabled)}} onClick={(e) => { e.stopPropagation(); openTradeModal(asset, 'buy'); }}>Al</button> <button disabled={tradeButtonsDisabled} style={{...styles.tradeButton, ...styles.sellButton, ...(tradeButtonsDisabled && styles.tradeButtonDisabled)}} onClick={(e) => { e.stopPropagation(); openTradeModal(asset, 'sell'); }}>Sat</button> </div> </div> );
  };
  
  const renderMarket = () => ( <div style={{paddingBottom: 20}}> {companies.map(company => <AssetRow key={company.ticker} asset={company} />)} </div> );
  const renderForex = () => ( <div style={{paddingBottom: 20}}> {forex.map(fx => <AssetRow key={fx.ticker} asset={fx} />)} </div> );
  
  const renderPortfolio = () => {
    if(!user || !user.portfolio) return null;
    const allAssets = [...companies, ...forex];
    const portfolioItems = Object.keys(user.portfolio);
    if (portfolioItems.length === 0) {
      return <div style={styles.centerMessage}><p style={styles.centerMessageText}>Portföyünüzde hiç varlık yok.</p></div>;
    }
    return ( <div style={{paddingBottom: 20}}> {portfolioItems.map(ticker => { const asset = allAssets.find(a => a.ticker === ticker); if (!asset) return null; const amount = user.portfolio[ticker]; const currentValue = asset.price * amount; return ( <div key={ticker} style={styles.portfolioRow}> <div> <p style={styles.stockTicker}>{ticker}</p> <p style={styles.stockName}>{amount.toFixed(4)} Adet</p> </div> <div style={{textAlign: 'right'}}> <p style={styles.stockPrice}>₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p> <p style={styles.stockName}>Birim Fiyat: ₺{asset.price.toFixed(2)}</p> </div> </div> ); })} </div> );
  };
  
  const renderNews = () => ( <div style={{paddingBottom: 20}}> <div style={styles.newsHeader}> <h2 style={{margin: '15px 0'}}>Haberler</h2> <button style={styles.secondaryButton} onClick={() => setColumnsModalVisible(true)}>Köşe Yazıları</button> </div> {user.isFounder && ( <div style={styles.addNewsButton} onClick={() => setAddNewsModalVisible(true)}> + Yeni Haber Ekle </div> )} {news.map(item => ( <div key={item.id} style={styles.newsCard}> {user.isFounder && <button style={styles.deleteButton} onClick={() => handleDeleteNews(item.id)}><TrashIcon /></button>} <h3 style={styles.newsTitle}>{item.title}</h3> <p style={styles.newsContent}>{item.content}</p> <p style={styles.newsDate}>{new Date(item.date).toLocaleString('tr-TR')}</p> </div> ))} </div> );
  
  const renderAppContent = () => {
    let content;
    switch (activeTab) {
      case 'doviz': content = renderForex(); break;
      case 'portfoy': content = renderPortfolio(); break;
      case 'haberler': content = renderNews(); break;
      default: content = renderMarket();
    }
    const allAssets = [...companies, ...forex];
    const portfolioValue = (user && user.portfolio && allAssets.length > 0) ? Object.keys(user.portfolio).reduce((total, ticker) => { const asset = allAssets.find(a => a.ticker === ticker); return total + (asset ? asset.price * user.portfolio[ticker] : 0); }, 0) : 0;
    const totalAssets = (user?.balance || 0) + portfolioValue;
    let overrideButtonText;
    if (marketStatus.manualOverride !== null) {
      overrideButtonText = marketStatus.manualOverride ? "KAPAT" : "AÇ";
    } else {
      overrideButtonText = isMarketOpen ? "KAPAT" : "AÇ";
    }
    return ( <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}> <header style={styles.header}> <div> <p style={styles.headerText}>Toplam Varlık {user.isFounder && '(Yönetici)'}</p> <p style={styles.balanceText}>₺{totalAssets.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p> <p style={styles.subBalanceText}>Nakit: ₺{(user?.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p> </div> <div style={styles.headerRight}> <div style={styles.marketStatusContainer}> <div style={{ ...styles.marketStatusIndicator, ...(isMarketOpen ? styles.marketOpen : styles.marketClosed) }} /> <span style={styles.marketStatusText}>{isMarketOpen ? 'AÇIK' : 'KAPALI'}</span> </div> {user.isFounder && (<button style={styles.overrideButton} onClick={handleMarketOverrideToggle}> {overrideButtonText} </button>)} <span onClick={handleLogout} style={styles.logoutText}>Çıkış</span> </div> </header> <main style={styles.contentArea}>{content}</main> <nav style={styles.navBar}> <button style={styles.navButton} onClick={() => setActiveTab('piyasa')}> <span style={{...styles.navText, ...(activeTab === 'piyasa' && styles.navTextActive)}}>Piyasa</span> </button> <button style={styles.navButton} onClick={() => setActiveTab('doviz')}> <span style={{...styles.navText, ...(activeTab === 'doviz' && styles.navTextActive)}}>Döviz</span> </button> <button style={styles.navButton} onClick={() => setActiveTab('portfoy')}> <span style={{...styles.navText, ...(activeTab === 'portfoy' && styles.navTextActive)}}>Portföy</span> </button> <button style={styles.navButton} onClick={() => setActiveTab('haberler')}> <span style={{...styles.navText, ...(activeTab === 'haberler' && styles.navTextActive)}}>Haberler</span> </button> </nav> </div> );
  };
  
  if (user === undefined) {
      return <div style={{...styles.container, ...styles.authContainer, fontSize: 20}}>Yükleniyor...</div>
  }

  return ( <div style={styles.container}> {user === null ? renderAuthScreens() : renderAppContent()} {modalVisible && ( <div style={styles.modalOverlay}> <div style={styles.modalView}> <p style={styles.modalText}>{modalMessage}</p> <button style={{...styles.button, width: 'auto', padding: '10px 30px'}} onClick={() => setModalVisible(false)}> Tamam </button> </div> </div> )} {tradeModalVisible && ( <div style={styles.modalOverlay}> <div style={styles.modalView}> <h2 style={styles.modalTitle}>{selectedAsset?.ticker} {tradeAction === 'buy' ? 'Al' : 'Sat'}</h2> <p style={styles.modalInfo}>Fiyat: ₺{selectedAsset?.price.toFixed(2)}</p> <p style={styles.modalInfo}>Nakit Bakiye: ₺{user?.balance.toFixed(2)}</p> {tradeAction === 'sell' && <p style={styles.modalInfo}>Sahip Olunan: {user?.portfolio[selectedAsset?.ticker] || 0} Adet</p>} <input style={styles.input} placeholder="Adet Girin" type="number" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} /> <div style={styles.modalButtonContainer}> <button style={{...styles.modalButton, backgroundColor: '#555'}} onClick={() => setTradeModalVisible(false)}> İptal </button> <button style={{...styles.modalButton, backgroundColor: tradeAction === 'buy' ? '#28a745' : '#dc3545'}} onClick={executeTrade}> Onayla </button> </div> </div> </div> )} {addNewsModalVisible && ( <div style={styles.modalOverlay}> <div style={styles.modalView}> <h2 style={styles.modalTitle}>Yeni Haber Ekle</h2> <input style={styles.input} placeholder="Haber Başlığı" value={newNewsTitle} onChange={(e) => setNewNewsTitle(e.target.value)} /> <textarea style={{...styles.input, height: 80, resize: 'vertical'}} placeholder="Haber İçeriği" value={newNewsContent} onChange={(e) => setNewNewsContent(e.target.value)} /> <h3 style={styles.stockEffectTitle}>Hisse Senedi Etkileri (24 Saat)</h3> <div style={styles.effectsContainer}> {companies.map(company => ( <div key={company.ticker} style={styles.effectRow}> <span style={{flex: 1}}>{company.ticker}</span> <input type="number" placeholder="Etki %" style={styles.effectInput} value={newsEffects[company.ticker] || ''} onChange={(e) => { const newEffects = { ...newsEffects }; const value = e.target.value; if (value === '') { delete newEffects[company.ticker]; } else { newEffects[company.ticker] = parseFloat(value); } setNewsEffects(newEffects); }} /> </div> ))} </div> <div style={styles.modalButtonContainer}> <button style={{...styles.modalButton, backgroundColor: '#555'}} onClick={() => setAddNewsModalVisible(false)}>İptal</button> <button style={{...styles.modalButton, backgroundColor: '#007bff'}} onClick={handleAddNews}>Yayınla ve Etki Et</button> </div> </div> </div> )} {columnsModalVisible && ( <div style={styles.modalOverlay}> <div style={styles.columnsModalView}> <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}> <h2 style={styles.modalTitle}>Köşe Yazıları</h2> <button style={{background:'none', border:'none', color:'#fff', fontSize: '24px', cursor:'pointer'}} onClick={() => setColumnsModalVisible(false)}>×</button> </div> {user.isFounder && ( <div style={{padding: '10px', border: '1px solid #444', borderRadius: '10px', marginBottom: '20px'}}> <h3 style={{marginTop: 0}}>Yeni Yazı Ekle</h3> <input style={styles.input} placeholder="Yazı Başlığı" value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} /> <input style={styles.input} placeholder="Yazar Adı" value={newColumnAuthor} onChange={(e) => setNewColumnAuthor(e.target.value)} /> <textarea style={{...styles.input, height: '100px', resize: 'vertical'}} placeholder="İçerik" value={newColumnContent} onChange={(e) => setNewColumnContent(e.target.value)} /> <button style={styles.button} onClick={handleAddColumn}>Ekle</button> </div> )} <div style={{flex: 1, overflowY: 'auto'}}> {columns.map(item => ( <div key={item.id} style={styles.newsCard}> {user.isFounder && <button style={styles.deleteButton} onClick={() => handleDeleteColumn(item.id)}><TrashIcon /></button>} <h3 style={styles.newsTitle}>{item.title}</h3> <p style={{fontSize: 12, color: '#007bff', margin: '5px 0'}}>{item.author}</p> <p style={styles.newsContent}>{item.content}</p> <p style={styles.newsDate}>{new Date(item.date).toLocaleString('tr-TR')}</p> </div> ))} </div> </div> </div> )} {detailModalVisible && selectedStockForDetail && ( <div style={styles.modalOverlay} onClick={() => setDetailModalVisible(false)}> <div style={styles.detailModalView} onClick={(e) => e.stopPropagation()}> <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}> <h2 style={styles.modalTitle}>{selectedStockForDetail.name} ({selectedStockForDetail.ticker})</h2> <button style={{background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer'}} onClick={() => setDetailModalVisible(false)}>×</button> </div> <p style={styles.stockPrice}>Güncel Fiyat: ₺{selectedStockForDetail.price.toFixed(2)}</p> <div style={styles.chartContainer}> {isChartLoading ? <p style={{textAlign: 'center', color: '#aaa'}}>Grafik Yükleniyor...</p> : <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#aaa' } }, y: { ticks: 'auto' } } }} />} </div> <div style={styles.timeRangeContainer}> {['1G', '1H', '1A', '3A', '1Y', '2Y', '5Y'].map(range => ( <button key={range} style={{...styles.timeRangeButton, ...(chartTimeRange === range && styles.timeRangeButtonActive)}} onClick={() => handleTimeRangeChange(selectedStockForDetail.ticker, selectedStockForDetail.price, range)}> {range} </button> ))} </div> </div> </div> )} </div> );
}
