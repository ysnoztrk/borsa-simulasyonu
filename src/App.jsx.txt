import React, { useState, useEffect, useRef } from 'react';
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
// --- FIREBASE KÜTÜPHANELERİNİ İÇE AKTARMA ---
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
    arrayUnion
} from 'firebase/firestore';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

// --- FIREBASE YAPILANDIRMASI ---
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

const styles = {
  container: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', flex: 1, backgroundColor: '#121212', color: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, display: 'flex', flexDirection: 'column', },
  authTitle: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginBottom: 40, },
  input: { width: '100%', maxWidth: '400px', backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, color: '#FFF', marginBottom: 15, border: '1px solid #333', fontSize: '16px', boxSizing: 'border-box', },
  button: { width: '100%', maxWidth: '400px', backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, border: 'none', color: '#FFF', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', },
  switchText: { color: '#007bff', marginTop: 20, cursor: 'pointer', },
  header: { padding: '15px 20px', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' },
  headerText: { color: '#aaa', fontSize: 14, margin: 0, },
  balanceText: { color: '#FFF', fontSize: 28, fontWeight: 'bold', margin: '4px 0', },
  subBalanceText:{ color: '#aaa', fontSize: 14, margin: 0, },
  logoutText: { color: '#dc3545', fontSize: 16, cursor: 'pointer' },
  marketStatusContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '15px', },
  marketStatusIndicator: { width: '10px', height: '10px', borderRadius: '5px', },
  marketOpen: { backgroundColor: '#28a745', },
  marketClosed: { backgroundColor: '#dc3545', },
  marketStatusText: { fontSize: '14px', fontWeight: 'bold', },
  overrideButton: { backgroundColor: '#444', color: '#fff', border: '1px solid #666', borderRadius: '5px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', },
  contentArea: { flex: 1, overflowY: 'auto', },
  navBar: { display: 'flex', flexDirection: 'row', height: 60, backgroundColor: '#1e1e1e', borderTop: '1px solid #333' },
  navButton: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: 'none', border: 'none' },
  navText: { color: '#888', fontSize: 16, },
  navTextActive: { color: '#007bff', fontWeight: 'bold', },
  stockRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #1e1e1e', cursor: 'pointer', },
  stockInfo: { flex: 2, },
  stockTicker: { fontSize: 18, fontWeight: 'bold', color: '#FFF', margin: 0, },
  stockName: { fontSize: 14, color: '#888', margin: 0, },
  stockPriceContainer: { flex: 1.5, textAlign: 'right', },
  stockPrice: { fontSize: 18, color: '#FFF', margin: 0, },
  stockChange: { fontSize: 14, },
  priceUp: { color: '#28a745', },
  priceDown: { color: '#dc3545', },
  stockActions: { flex: 1.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', },
  tradeButton: { padding: '8px 15px', borderRadius: 5, marginLeft: 10, border: 'none', color: '#FFF', fontWeight: 'bold', cursor: 'pointer' },
  tradeButtonDisabled: { backgroundColor: '#555', cursor: 'not-allowed', },
  buyButton: { backgroundColor: '#28a745' },
  sellButton: { backgroundColor: '#dc3545' },
  adminPriceButton: { background: 'none', border: '1px solid #555', color: '#fff', width: '28px', height: '28px', borderRadius: '14px', cursor: 'pointer', marginLeft: '8px', fontSize: '18px', lineHeight: '24px' },
  adminControlPanel: { backgroundColor: '#1e1e1e', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', },
  adminControlLabel: { fontSize: '14px', color: '#aaa', },
  centerMessage: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' },
  centerMessageText: { color: '#888', fontSize: 16, },
  portfolioRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', padding: 20, margin: '10px 15px', borderRadius: 10, },
  newsCard: { backgroundColor: '#1e1e1e', padding: 15, margin: '10px 15px', borderRadius: 10, },
  newsTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 5, margin: 0, },
  newsContent: { fontSize: 14, color: '#ccc', marginBottom: 10, margin: '5px 0 10px 0', },
  newsDate: { fontSize: 12, color: '#888', textAlign: 'right', },
  addNewsButton: { backgroundColor: '#007bff', padding: 12, margin: 15, borderRadius: 8, textAlign: 'center', color: '#FFF', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, },
  modalView: { width: '90%', maxWidth: '500px', backgroundColor: '#1e1e1e', borderRadius: 20, padding: 25, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.25)', },
  detailModalView: { width: '90%', maxWidth: '800px', backgroundColor: '#2a2a2a', borderRadius: 20, padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', },
  modalText: { marginBottom: 15, textAlign: 'center', color: '#FFF', fontSize: 18, },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 15, textAlign: 'center', },
  modalInfo: { fontSize: 16, color: '#aaa', marginBottom: 5, },
  modalButtonContainer: { display: 'flex', flexDirection: 'row', marginTop: 20, width: '100%', },
  modalButton: { flex: 1, borderRadius: 10, padding: 12, margin: '0 5px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  chartContainer: { width: '100%', height: '300px', marginTop: '20px', },
  timeRangeContainer: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap', },
  timeRangeButton: { background: '#333', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', },
  timeRangeButtonActive: { background: '#007bff', },
  stockEffectTitle: { fontSize: 18, fontWeight: 'bold', color: '#ccc', marginTop: 20, marginBottom: 10, borderTop: '1px solid #444', paddingTop: 15, textAlign: 'center', },
  effectsContainer: { maxHeight: '200px', overflowY: 'auto', width: '100%', paddingRight: '10px' },
  effectRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', width: '100%', },
  effectInput: { width: '80px', backgroundColor: '#333', border: '1px solid #555', color: '#fff', padding: '8px', borderRadius: '5px', textAlign: 'right', }
};

const FOUNDER_EMAIL = 'kurucu@borsa.sim';
const INITIAL_COMPANIES = [
    { id: '1', name: 'TeknoDev A.Ş.', ticker: 'TKNDV', price: 150.75, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
    { id: '2', name: 'Gelecek Gıda Ltd.', ticker: 'GLCGD', price: 75.50, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
    { id: '3', name: 'Enerji Çözümleri A.Ş.', ticker: 'ENRCS', price: 210.00, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
    { id: '4', name: 'Sağlık Grubu Global', ticker: 'SGLBL', price: 320.40, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
    { id: '5', name: 'Otomotiv Lideri A.Ş.', ticker: 'OTLDR', price: 450.60, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
    { id: '6', name: 'Bulut Bilişim Tech', ticker: 'BLTBL', price: 620.00, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
    { id: '7', name: 'Yeşil Tarım A.Ş.', ticker: 'YSTRM', price: 95.20, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
    { id: '8', name: 'Perakende Zinciri A.Ş.', ticker: 'PRKND', price: 180.90, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
    { id: '9', name: 'İnşaat Holding', ticker: 'INSHL', price: 112.30, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
    { id: '10', name: 'Turizm ve Otelcilik', ticker: 'TRZMO', price: 250.00, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null },
];
const INITIAL_NEWS = [
  { title: 'TeknoDev Yeni Bir Yapay Zeka Modeli Duyurdu!', content: 'TeknoDev A.Ş., bugün düzenlediği basın toplantısıyla verimliliği %40 artıracak yeni nesil yapay zeka modelini tanıttı. Hisselerde hareketlilik bekleniyor.', date: new Date().toISOString() },
  { title: 'Gelecek Gıda, Organik Ürün Yelpazesini Genişletiyor', content: 'Gelecek Gıda, artan talebi karşılamak için 5 yeni organik ürününü piyasaya sürdü. Şirket, pazar payını artırmayı hedefliyor.', date: new Date(Date.now() - 86400000).toISOString() },
];

const mulberry32 = (a) => {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const generateConsistentHistoricalData = (ticker, currentPrice, range) => {
    let seed = 0;
    for (let i = 0; i < ticker.length; i++) {
        seed += ticker.charCodeAt(i);
    }
    const random = mulberry32(seed);

    const now = new Date();
    let data = [];
    let labels = [];
    let points, interval;

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
        if (i > 0) {
            price *= (1 + (random() - 0.5) * 0.15);
        }
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
  const [news, setNews] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
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
  
  const [marketStatus, setMarketStatus] = useState({
      isScheduledOpen: false,
      manualOverride: null,
      volatility: 0.04
  });
  
  const isMarketOpen = marketStatus.manualOverride !== null ? marketStatus.manualOverride : marketStatus.isScheduledOpen;
  
  const timersRef = useRef({});
  const companiesRef = useRef(companies);
  const marketStatusRef = useRef(marketStatus);
  useEffect(() => { companiesRef.current = companies; }, [companies]);
  useEffect(() => { marketStatusRef.current = marketStatus; }, [marketStatus]);

  useEffect(() => {
    const checkAndCreateInitialData = async () => {
      const founderDocRef = doc(db, 'users', FOUNDER_EMAIL);
      const founderSnap = await getDoc(founderDocRef);
      if (!founderSnap.exists()) {
          await setDoc(founderDocRef, { email: FOUNDER_EMAIL, balance: 1000000, portfolio: {}, isFounder: true });
          try {
              await createUserWithEmailAndPassword(auth, FOUNDER_EMAIL, 'kurucu123');
          } catch (error) { console.warn("Kurucu auth hesabı zaten var veya oluşturulamadı."); }
      }
      
      const marketStatusDocRef = doc(db, 'status', 'market');
      const marketSnap = await getDoc(marketStatusDocRef);
      if (!marketSnap.exists()) {
        await setDoc(marketStatusDocRef, { isScheduledOpen: false, manualOverride: null, volatility: 0.04 });
      }

      for (const company of INITIAL_COMPANIES) {
        const historyDocRef = doc(db, 'priceHistory', company.ticker);
        const historySnap = await getDoc(historyDocRef);
        if (!historySnap.exists()) {
          await setDoc(historyDocRef, { history: [] });
        }
      }
    };
    checkAndCreateInitialData();

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
            const userDocRef = doc(db, 'users', authUser.email);
            const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) { setUser({ uid: authUser.uid, ...docSnap.data() }); } 
                else { signOut(auth); }
            });
            return () => unsubscribeUser();
        } else { setUser(null); }
    });

    const unsubscribeCompanies = onSnapshot(query(collection(db, 'marketData')), (snapshot) => {
        const companiesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        if (companiesData.length === 0) {
            const batch = writeBatch(db);
            INITIAL_COMPANIES.forEach(company => { 
                const companyRef = doc(db, 'marketData', company.ticker);
                batch.set(companyRef, company); 
            });
            batch.commit();
        } else { setCompanies(companiesData); }
    });

    const unsubscribeNews = onSnapshot(query(collection(db, 'news'), orderBy('date', 'desc')), (snapshot) => {
        const newsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
         if (newsData.length === 0) {
            const batch = writeBatch(db);
            INITIAL_NEWS.forEach(newsItem => {
                const newDocRef = doc(collection(db, 'news'));
                batch.set(newDocRef, newsItem);
            });
            batch.commit();
        } else { setNews(newsData); }
    });

    const unsubscribeMarket = onSnapshot(doc(db, 'status', 'market'), (docSnap) => {
        if (docSnap.exists()) { setMarketStatus(docSnap.data()); }
    });

    return () => { 
        unsubscribeAuth(); 
        unsubscribeCompanies(); 
        unsubscribeNews(); 
        unsubscribeMarket(); 
    };
  }, []);

  useEffect(() => {
    let priceLoggerInterval;
    if (user?.isFounder && isMarketOpen) {
      priceLoggerInterval = setInterval(async () => {
        const batch = writeBatch(db);
        const currentCompanies = companiesRef.current;
        if (currentCompanies.length === 0) return;

        currentCompanies.forEach(company => {
          const historyRef = doc(db, 'priceHistory', company.ticker);
          batch.update(historyRef, {
            history: arrayUnion({
              price: company.price,
              timestamp: Date.now()
            })
          });
        });
        await batch.commit();
        console.log("Fiyat geçmişleri kaydedildi.");
      }, 15 * 60 * 1000);
    }
    return () => clearInterval(priceLoggerInterval);
  }, [user?.isFounder, isMarketOpen]);

  useEffect(() => {
    const stopEngine = () => {
        Object.values(timersRef.current).forEach(clearTimeout);
        timersRef.current = {};
    };

    const updateCompanyPrice = async (companyId) => {
        const currentCompanies = companiesRef.current;
        const currentMarketStatus = marketStatusRef.current;
        const companyToUpdate = currentCompanies.find(c => c.ticker === companyId);
        const isMarketStillOpen = currentMarketStatus.manualOverride !== null ? currentMarketStatus.manualOverride : currentMarketStatus.isScheduledOpen;

        if (!isMarketStillOpen || !companyToUpdate) {
            delete timersRef.current[companyId];
            return;
        }

        let trendBias = 0.5;
        if (companyToUpdate.effectExpiry && companyToUpdate.effectExpiry > Date.now()) {
            if (companyToUpdate.price < companyToUpdate.targetPrice) { trendBias = 0.3; }
            else { trendBias = 0.7; }
        } else if (companyToUpdate.effectExpiry && companyToUpdate.effectExpiry <= Date.now()) {
            const companyRef = doc(db, 'marketData', companyToUpdate.ticker);
            await updateDoc(companyRef, { targetPrice: null, effectExpiry: null });
        }
        
        const changePercent = (Math.random() - trendBias) * currentMarketStatus.volatility;
        const changeAmount = companyToUpdate.price * changePercent;
        const newPrice = Math.max(1, companyToUpdate.price + changeAmount);
        
        const companyRef = doc(db, 'marketData', companyToUpdate.ticker);
        await updateDoc(companyRef, {
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(changeAmount.toFixed(2)),
            lastChangePercent: changePercent,
        });
        
        const differenceFromLast = Math.abs(changePercent - (companyToUpdate.lastChangePercent || 0));
        const nextInterval = differenceFromLast > 0.01 ? 30000 : 5000;
        
        timersRef.current[companyId] = setTimeout(() => { updateCompanyPrice(companyId); }, nextInterval);
    };
    
    if (user?.isFounder && isMarketOpen) {
        const currentCompanies = companiesRef.current;
        currentCompanies.forEach(company => {
            if (!timersRef.current[company.ticker]) {
                timersRef.current[company.ticker] = setTimeout(() => updateCompanyPrice(company.ticker), Math.random() * 5000 + 1000);
            }
        });
    } else {
      stopEngine();
    }

    return () => { stopEngine(); };
  }, [isMarketOpen, user?.isFounder]);

  const showModal = (message) => { setModalMessage(message); setModalVisible(true); };
  
  const handleRegister = async () => {
      if (!email || !password || !confirmPassword) { showModal("Lütfen tüm alanları doldurun."); return; }
      if (password !== confirmPassword) { showModal("Şifreler eşleşmiyor."); return; }
      if (email === FOUNDER_EMAIL) { showModal('Bu e-posta adresi kurucuya aittir.'); return; }
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
  
  const openTradeModal = (company, action) => { setSelectedCompany(company); setTradeAction(action); setTradeModalVisible(true); setTradeAmount(''); };
  
  const executeTrade = async () => {
      const amount = parseInt(tradeAmount, 10);
      if(isNaN(amount) || amount <= 0) { showModal("Geçerli bir miktar girin."); return; }
      const totalCost = selectedCompany.price * amount;
      const userDocRef = doc(db, "users", user.email);

      if (tradeAction === 'buy') {
          if (user.balance < totalCost) { showModal('Yetersiz bakiye!'); return; }
          const newBalance = user.balance - totalCost;
          const newPortfolio = { ...user.portfolio };
          newPortfolio[selectedCompany.ticker] = (newPortfolio[selectedCompany.ticker] || 0) + amount;
          await updateDoc(userDocRef, { balance: newBalance, portfolio: newPortfolio });
      } else {
          const currentShares = user.portfolio[selectedCompany.ticker] || 0;
          if (currentShares < amount) { showModal('Yetersiz hisse!'); return; }
          const newBalance = user.balance + totalCost;
          const newPortfolio = { ...user.portfolio };
          newPortfolio[selectedCompany.ticker] -= amount;
          if (newPortfolio[selectedCompany.ticker] === 0) { delete newPortfolio[selectedCompany.ticker]; }
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
              batch.update(companyRef, { targetPrice: Math.max(1, target), effectExpiry: expiryTime });
          }
      });
      await batch.commit();
      setAddNewsModalVisible(false); setNewNewsTitle(''); setNewNewsContent(''); setNewsEffects({});
      showModal("Haber başarıyla yayınlandı ve piyasa etkileri ayarlandı.");
  };
  
  const handleMarketOverrideToggle = async () => {
      const marketStatusRef = doc(db, 'status', 'market');
      if (marketStatus.manualOverride !== null) { await updateDoc(marketStatusRef, { manualOverride: null }); } 
      else { await updateDoc(marketStatusRef, { manualOverride: !isMarketOpen }); }
  };
  
  const handleTimeRangeChange = async (ticker, currentPrice, range) => { 
      setIsChartLoading(true);
      setChartTimeRange(range); 
      let history = { labels: [], data: [] };

      if (range === '1G' || range === '1H') {
        const historyDocRef = doc(db, 'priceHistory', ticker);
        const historySnap = await getDoc(historyDocRef);
        if (historySnap.exists()) {
          const allHistory = historySnap.data().history;
          const now = Date.now();
          const timeLimit = range === '1G' ? (now - 24 * 60 * 60 * 1000) : (now - 7 * 24 * 60 * 60 * 1000);
          const filteredHistory = allHistory.filter(p => p.timestamp >= timeLimit);
          if (filteredHistory.length > 0) {
              history.labels = filteredHistory.map(p => new Date(p.timestamp).toLocaleTimeString('tr-TR'));
              history.data = filteredHistory.map(p => p.price);
          }
        }
        if (history.data.length === 0) {
            history.labels = ['Yeterli Veri Yok'];
            history.data = [currentPrice];
        }
      } else {
        history = generateConsistentHistoricalData(ticker, currentPrice, range);
      }
      
      setChartData({ 
          labels: history.labels, 
          datasets: [{ label: 'Fiyat (₺)', data: history.data, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.2)', fill: true, tension: 0.1 }] 
      }); 
      setIsChartLoading(false);
  };

  const handleStockClick = (company) => { 
      setSelectedStockForDetail(company); 
      setChartTimeRange('1A');
      handleTimeRangeChange(company.ticker, company.price, '1A');
      setDetailModalVisible(true); 
  };

  const renderAuthScreens = () => (
    <div style={styles.authContainer}>
      <h1 style={styles.authTitle}>Borsa Simülasyonu</h1>
      <input style={styles.input} placeholder="E-posta Adresi" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input style={styles.input} placeholder="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {screen === 'register' && (
        <input style={styles.input} placeholder="Şifre Tekrar" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      )}
      <button style={styles.button} onClick={screen === 'login' ? handleLogin : handleRegister}>
        {screen === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
      </button>
      <p style={styles.switchText} onClick={() => setScreen(screen === 'login' ? 'register' : 'login')}>
        {screen === 'login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
      </p>
    </div>
  );
  
  const renderMarket = () => (
    <div>
      {user.isFounder && (
        <div style={styles.adminControlPanel}>
          <label style={styles.adminControlLabel}>Piyasa Oynaklığı: %{(marketStatus.volatility * 100).toFixed(2)}</label>
          <input type="range" min="0.01" max="0.2" step="0.01" value={marketStatus.volatility} onChange={async (e) => {
            const newVolatility = parseFloat(e.target.value);
            setMarketStatus(s => ({...s, volatility: newVolatility}));
            await updateDoc(doc(db, 'status', 'market'), { volatility: newVolatility });
          }} />
        </div>
      )}
      {companies.map(company => {
        const priceChangeStyle = company.change >= 0 ? styles.priceUp : styles.priceDown;
        const tradeButtonsDisabled = !isMarketOpen;
        return (
          <div key={company.ticker} style={styles.stockRow} onClick={() => handleStockClick(company)}>
            <div style={styles.stockInfo}>
              <p style={styles.stockTicker}>{company.ticker}</p>
              <p style={styles.stockName}>{company.name}</p>
            </div>
            <div style={styles.stockPriceContainer}>
              <p style={styles.stockPrice}>₺{company.price.toFixed(2)}</p>
              <span style={{...styles.stockChange, ...priceChangeStyle}}>
                {company.change >= 0 ? '+' : ''}{company.change.toFixed(2)}
              </span>
            </div>
            <div style={styles.stockActions}>
              <button disabled={tradeButtonsDisabled} style={{...styles.tradeButton, ...styles.buyButton, ...(tradeButtonsDisabled && styles.tradeButtonDisabled)}} onClick={(e) => { e.stopPropagation(); openTradeModal(company, 'buy'); }}>Al</button>
              <button disabled={tradeButtonsDisabled} style={{...styles.tradeButton, ...styles.sellButton, ...(tradeButtonsDisabled && styles.tradeButtonDisabled)}} onClick={(e) => { e.stopPropagation(); openTradeModal(company, 'sell'); }}>Sat</button>
            </div>
          </div>
        );
      })}
    </div>
  );
  
  const renderPortfolio = () => {
    if(!user || !user.portfolio) return null;
    const portfolioItems = Object.keys(user.portfolio);
    if (portfolioItems.length === 0) {
      return <div style={styles.centerMessage}><p style={styles.centerMessageText}>Portföyünüzde hiç hisse yok.</p></div>;
    }
    return (
      <div>
        {portfolioItems.map(ticker => {
          const company = companies.find(c => c.ticker === ticker);
          if (!company) return null;
          const shares = user.portfolio[ticker];
          const currentValue = company.price * shares;
          return (
            <div key={ticker} style={styles.portfolioRow}>
              <div>
                <p style={styles.stockTicker}>{ticker}</p>
                <p style={styles.stockName}>{shares} Adet</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <p style={styles.stockPrice}>₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p style={styles.stockName}>Birim Fiyat: ₺{company.price.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderNews = () => (
    <div>
      {user.isFounder && (
        <div style={styles.addNewsButton} onClick={() => setAddNewsModalVisible(true)}>
          + Yeni Haber Ekle
        </div>
      )}
      {news.map(item => (
        <div key={item.id} style={styles.newsCard}>
          <h3 style={styles.newsTitle}>{item.title}</h3>
          <p style={styles.newsContent}>{item.content}</p>
          <p style={styles.newsDate}>{new Date(item.date).toLocaleString('tr-TR')}</p>
        </div>
      ))}
    </div>
  );
  
  const renderAppContent = () => {
    let content;
    switch (activeTab) {
      case 'portfoy': content = renderPortfolio(); break;
      case 'haberler': content = renderNews(); break;
      default: content = renderMarket();
    }
    const portfolioValue = (user && user.portfolio && companies.length > 0) ? Object.keys(user.portfolio).reduce((total, ticker) => {
      const company = companies.find(c => c.ticker === ticker);
      return total + (company ? company.price * user.portfolio[ticker] : 0);
    }, 0) : 0;
    const totalAssets = (user?.balance || 0) + portfolioValue;
    let overrideButtonText;
    if (marketStatus.manualOverride !== null) {
      overrideButtonText = "Otomatik Ayara Dön";
    } else {
      overrideButtonText = isMarketOpen ? "Piyasayı Kapat" : "Piyasayı Aç";
    }
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={styles.header}>
          <div>
            <p style={styles.headerText}>Toplam Varlık {user.isFounder && '(Kurucu)'}</p>
            <p style={styles.balanceText}>₺{totalAssets.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p style={styles.subBalanceText}>Nakit: ₺{(user?.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.marketStatusContainer}>
              <div style={{ ...styles.marketStatusIndicator, ...(isMarketOpen ? styles.marketOpen : styles.marketClosed) }} />
              <span style={styles.marketStatusText}>{isMarketOpen ? 'Piyasa Açık' : 'Piyasa Kapalı'}</span>
            </div>
            {user.isFounder && (<button style={styles.overrideButton} onClick={handleMarketOverrideToggle}> {overrideButtonText} </button>)}
            <span onClick={handleLogout} style={styles.logoutText}>Çıkış</span>
          </div>
        </header>
        <main style={styles.contentArea}>{content}</main>
        <nav style={styles.navBar}>
          <button style={styles.navButton} onClick={() => setActiveTab('piyasa')}>
            <span style={{...styles.navText, ...(activeTab === 'piyasa' && styles.navTextActive)}}>Piyasa</span>
          </button>
          <button style={styles.navButton} onClick={() => setActiveTab('portfoy')}>
            <span style={{...styles.navText, ...(activeTab === 'portfoy' && styles.navTextActive)}}>Portföy</span>
          </button>
          <button style={styles.navButton} onClick={() => setActiveTab('haberler')}>
            <span style={{...styles.navText, ...(activeTab === 'haberler' && styles.navTextActive)}}>Haberler</span>
          </button>
        </nav>
      </div>
    );
  };
  
  if (user === undefined) {
      return <div style={{...styles.container, ...styles.authContainer, fontSize: 20}}>Yükleniyor...</div>
  }

  return (
    <div style={styles.container}>
      {user === null ? renderAuthScreens() : renderAppContent()}
      
      {modalVisible && (
        <div style={styles.modalOverlay}>
            <div style={styles.modalView}>
                <p style={styles.modalText}>{modalMessage}</p>
                <button style={{...styles.button, width: 'auto', padding: '10px 30px'}} onClick={() => setModalVisible(false)}> Tamam </button>
            </div>
        </div>
      )}

      {tradeModalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalView}>
            <h2 style={styles.modalTitle}>{selectedCompany?.ticker} Hisse {tradeAction === 'buy' ? 'Al' : 'Sat'}</h2>
            <p style={styles.modalInfo}>Fiyat: ₺{selectedCompany?.price.toFixed(2)}</p>
            <p style={styles.modalInfo}>Nakit Bakiye: ₺{user?.balance.toFixed(2)}</p>
            {tradeAction === 'sell' && <p style={styles.modalInfo}>Sahip Olunan: {user?.portfolio[selectedCompany?.ticker] || 0} Adet</p>}
            <input style={styles.input} placeholder="Adet Girin" type="number" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} />
            <div style={styles.modalButtonContainer}>
              <button style={{...styles.modalButton, backgroundColor: '#555'}} onClick={() => setTradeModalVisible(false)}> İptal </button>
              <button style={{...styles.modalButton, backgroundColor: tradeAction === 'buy' ? '#28a745' : '#dc3545'}} onClick={executeTrade}> Onayla </button>
            </div>
          </div>
        </div>
      )}
      
      {addNewsModalVisible && (
        <div style={styles.modalOverlay}>
            <div style={styles.modalView}>
                <h2 style={styles.modalTitle}>Yeni Haber Ekle</h2>
                <input style={styles.input} placeholder="Haber Başlığı" value={newNewsTitle} onChange={(e) => setNewNewsTitle(e.target.value)} />
                <textarea style={{...styles.input, height: 80, resize: 'vertical'}} placeholder="Haber İçeriği" value={newNewsContent} onChange={(e) => setNewNewsContent(e.target.value)} />
                <h3 style={styles.stockEffectTitle}>Hisse Senedi Etkileri (24 Saat)</h3>
                <div style={styles.effectsContainer}>
                    {companies.map(company => (
                        <div key={company.ticker} style={styles.effectRow}>
                            <span style={{flex: 1}}>{company.ticker}</span>
                            <input
                                type="number"
                                placeholder="Etki %"
                                style={styles.effectInput}
                                value={newsEffects[company.ticker] || ''}
                                onChange={(e) => {
                                    const newEffects = { ...newsEffects };
                                    const value = e.target.value;
                                    if (value === '') { delete newEffects[company.ticker]; } 
                                    else { newEffects[company.ticker] = parseFloat(value); }
                                    setNewsEffects(newEffects);
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div style={styles.modalButtonContainer}>
                    <button style={{...styles.modalButton, backgroundColor: '#555'}} onClick={() => setAddNewsModalVisible(false)}>İptal</button>
                    <button style={{...styles.modalButton, backgroundColor: '#007bff'}} onClick={handleAddNews}>Yayınla ve Etki Et</button>
                </div>
            </div>
        </div>
      )}

      {detailModalVisible && selectedStockForDetail && (
        <div style={styles.modalOverlay} onClick={() => setDetailModalVisible(false)}>
            <div style={styles.detailModalView} onClick={(e) => e.stopPropagation()}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 style={styles.modalTitle}>{selectedStockForDetail.name} ({selectedStockForDetail.ticker})</h2>
                     <button style={{background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer'}} onClick={() => setDetailModalVisible(false)}>×</button>
                </div>
                <p style={styles.stockPrice}>Güncel Fiyat: ₺{selectedStockForDetail.price.toFixed(2)}</p>
                <div style={styles.chartContainer}>
                    {isChartLoading ? <p style={{textAlign: 'center', color: '#aaa'}}>Grafik Yükleniyor...</p> : <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#aaa' } }, y: { ticks: { color: '#aaa' } } } }} />}
                </div>
                <div style={styles.timeRangeContainer}>
                    {['1G', '1H', '1A', '3A', '1Y', '2Y', '5Y'].map(range => (
                        <button 
                            key={range} 
                            style={{...styles.timeRangeButton, ...(chartTimeRange === range && styles.timeRangeButtonActive)}}
                            onClick={() => handleTimeRangeChange(selectedStockForDetail.ticker, selectedStockForDetail.price, range)}>
                            {range}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

