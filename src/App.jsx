import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Timestamp,
  arrayUnion
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

// --- İKONLAR & STİLLER ---
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /> <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /> </svg>);

const styles = {
  container: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', flex: 1, backgroundColor: '#121212', color: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, display: 'flex', flexDirection: 'column', height: '100vh' },
  authTitle: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginBottom: 40, },
  input: { width: '100%', maxWidth: '400px', backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, color: '#FFF', marginBottom: 15, border: '1px solid #333', fontSize: '16px', boxSizing: 'border-box', },
  button: { width: '100%', maxWidth: '400px', backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, border: 'none', color: '#FFF', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', },
  switchText: { color: '#007bff', marginTop: 20, cursor: 'pointer', },
  header: { padding: '10px 20px', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', gap: '15px' },
  headerText: { color: '#aaa', fontSize: 14, margin: 0, },
  balanceText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', margin: '4px 0', },
  subBalanceText: { color: '#aaa', fontSize: 14, margin: 0, },
  logoutText: { color: '#dc3545', fontSize: 14, cursor: 'pointer', marginLeft: 15 },
  marketStatusContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '15px', },
  marketStatusIndicator: { width: '10px', height: '10px', borderRadius: '5px', },
  marketOpen: { backgroundColor: '#28a745', },
  marketClosed: { backgroundColor: '#dc3545', },
  marketStatusText: { fontSize: '12px', fontWeight: 'bold', },
  overrideButton: { backgroundColor: '#444', color: '#fff', border: '1px solid #666', borderRadius: '5px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', },

  // Slider Stili
  sliderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' },
  sliderLabel: { fontSize: '10px', color: '#aaa', marginBottom: '2px' },
  sliderInput: { width: '100%', cursor: 'pointer', accentColor: '#007bff' },

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

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 9999 },
  modalView: { width: '90%', maxWidth: '400px', backgroundColor: '#1e1e1e', borderRadius: 20, padding: 25, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.25)', },
  columnsModalView: { width: '90%', maxWidth: '700px', height: '80vh', backgroundColor: '#2a2a2a', borderRadius: 20, padding: 25, display: 'flex', flexDirection: 'column', },
  detailModalView: { width: '95%', maxWidth: '800px', backgroundColor: '#2a2a2a', borderRadius: 20, padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', zIndex: 10001 },
  modalText: { marginBottom: 15, textAlign: 'center', color: '#FFF', fontSize: 16, },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 15, textAlign: 'center', },
  modalInfo: { fontSize: 14, color: '#aaa', marginBottom: 5, },
  modalButtonContainer: { display: 'flex', flexDirection: 'row', marginTop: 20, width: '100%', },
  modalButton: { flex: 1, borderRadius: 10, padding: 12, margin: '0 5px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  chartContainer: { width: '100%', height: '300px', marginTop: '20px', position: 'relative' },
  timeRangeContainer: { display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '20px', flexWrap: 'wrap', },
  timeRangeButton: { background: '#333', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: 12 },
  timeRangeButtonActive: { background: '#007bff', },
  stockEffectTitle: { fontSize: 16, fontWeight: 'bold', color: '#ccc', marginTop: 20, marginBottom: 10, borderTop: '1px solid #444', paddingTop: 15, textAlign: 'center', },
  effectsContainer: { maxHeight: '150px', overflowY: 'auto', width: '100%', paddingRight: '10px' },
  effectRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', width: '100%', },
  effectInput: { width: '60px', backgroundColor: '#333', border: '1px solid #555', color: '#fff', padding: '5px', borderRadius: '5px', textAlign: 'right', },
  statusBadge: { fontSize: 10, padding: '2px 6px', borderRadius: 4, marginLeft: 8, fontWeight: 'bold' },
  statusReal: { backgroundColor: 'rgba(40, 167, 69, 0.2)', color: '#28a745', border: '1px solid #28a745' },
  statusSim: { backgroundColor: 'rgba(255, 193, 7, 0.2)', color: '#ffc107', border: '1px solid #ffc107' }
};

const FOUNDER_EMAIL = 'kurucu@borsa.sim';
// Initial data (sadece boşsa kullanılır)
const INITIAL_COMPANIES = [
  { name: 'TeknoDev A.Ş.', ticker: 'TKNDV', price: 150.75, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
  { name: 'Gelecek Gıda Ltd.', ticker: 'GLCGD', price: 75.50, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
  { name: 'Enerji Çözümleri A.Ş.', ticker: 'ENRCS', price: 210.00, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
  { name: 'Sağlık Grubu Global', ticker: 'SGLBL', price: 320.40, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
  { name: 'Otomotiv Lideri A.Ş.', ticker: 'OTLDR', price: 450.60, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
  { name: 'Bulut Bilişim Tech', ticker: 'BLTBL', price: 620.00, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
  { name: 'Yeşil Tarım A.Ş.', ticker: 'YSTRM', price: 95.20, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
  { name: 'Perakende Zinciri A.Ş.', ticker: 'PRKND', price: 180.90, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
  { name: 'İnşaat Holding', ticker: 'INSHL', price: 112.30, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
  { name: 'Turizm ve Otelcilik', ticker: 'TRZMO', price: 250.00, change: 0, lastChangePercent: 0, trend: 'stable', trendDuration: 0, targetPrice: null, effectExpiry: null, isReal: false },
];
const INITIAL_FOREX = [
  { name: 'Amerikan Doları', ticker: 'USD', price: 34.20, change: 0, lastChangePercent: 0, isReal: true },
  { name: 'Euro', ticker: 'EUR', price: 36.80, change: 0, lastChangePercent: 0, isReal: true },
  { name: 'Gram Altın', ticker: 'XAU', price: 2500.00, change: 0, lastChangePercent: 0, isReal: true },
];
const INITIAL_NEWS = [
  { title: 'TeknoDev Yeni Bir Yapay Zeka Modeli Duyurdu!', content: 'TeknoDev A.Ş., bugün düzenlediği basın toplantısıyla verimliliği %40 artıracak yeni nesil yapay zeka modelini tanıttı.', date: new Date().toISOString() },
];
const INITIAL_COLUMNS = [
  { title: 'Piyasalarda Yapay Zeka Rüzgarı', content: 'Son dönemde teknoloji hisselerinde yaşanan yükseliş, yapay zeka alanındaki gelişmelerle doğrudan ilişkili...', author: 'Ahmet Yılmaz', date: new Date().toISOString() }
];

// --- GRAFİK ALGORİTMASI ---
const mulberry32 = (a) => {
  return function () {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
};

const generateMasterHistory = (ticker) => {
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) seed += ticker.charCodeAt(i);
  const random = mulberry32(seed);

  const points = 1825; // 5 Yıl
  const data = new Array(points);
  let price = 100 + (random() * 50);

  for (let i = 0; i < points; i++) {
    const change = (random() - 0.5) * 0.03;
    price = price * (1 + change);
    data[i] = price;
  }
  return data;
};

const getRangeData = (masterData, range, currentPrice, realHistoryData = []) => {
  if (!currentPrice || isNaN(currentPrice) || !masterData || masterData.length === 0) {
    return { labels: [], data: [], labelFormat: 'full' };
  }

  const now = new Date();
  let daysToTake;
  let labelFormat;

  // 1H: 1 Hafta, 1A: 1 Ay, 3A: 3 Ay, 6A: 6 Ay, 1Y: 1 Yıl, 2Y: 2 Yıl, 3Y: 3 Yıl
  switch (range) {
    case '1H': daysToTake = 7; labelFormat = 'full'; break;             // 1 Hafta
    case '1A': daysToTake = 30; labelFormat = 'full'; break;            // 1 Ay
    case '3A': daysToTake = 90; labelFormat = 'full'; break;            // 3 Ay
    case '6A': daysToTake = 180; labelFormat = 'full'; break;           // 6 Ay
    case '1Y': daysToTake = 365; labelFormat = 'year'; break;           // 1 Yıl
    case '2Y': daysToTake = 365 * 2; labelFormat = 'year'; break;       // 2 Yıl
    case '3Y': daysToTake = 365 * 3; labelFormat = 'year'; break;       // 3 Yıl
    default: daysToTake = 30; labelFormat = 'full';
  }

  // Gerçek history'yi işle: timestamp ve price içeren array
  const realPoints = realHistoryData
    .map(h => ({
      timestamp: h.timestamp?.toDate ? h.timestamp.toDate() : new Date(h.timestamp),
      price: typeof h.price === 'number' ? h.price : parseFloat(h.price)
    }))
    .filter(h => !isNaN(h.price) && h.price > 0)
    .sort((a, b) => a.timestamp - b.timestamp);

  const cutoffDate = new Date(now.getTime() - daysToTake * 24 * 60 * 60 * 1000);
  const recentRealPoints = realPoints.filter(p => p.timestamp >= cutoffDate);

  // Sanal master seriden gerekli kısmı al
  const slicedDataRaw = masterData.slice(-daysToTake);

  let finalData = [];
  let labels = [];

  if (recentRealPoints.length > 0) {
    // Gerçek veriler varsa: gerçek verileri kullan, eksik kısımları sanal seriyle doldur
    const oldestRealDate = recentRealPoints[0].timestamp;
    const oldestRealPrice = recentRealPoints[0].price;

    // Sanal seriden, gerçek verilerin başlangıcından önceki kısmı al
    const fakeDaysNeeded = Math.ceil((oldestRealDate - cutoffDate) / (24 * 60 * 60 * 1000));
    const fakeSlice = slicedDataRaw.slice(0, Math.max(0, slicedDataRaw.length - recentRealPoints.length));

    // Sanal kısmı gerçek başlangıç fiyatına göre ölçekle
    if (fakeSlice.length > 0) {
      const lastFakePrice = fakeSlice[fakeSlice.length - 1];
      const ratio = oldestRealPrice / lastFakePrice;
      const scaledFake = fakeSlice.map(p => parseFloat((p * ratio).toFixed(2)));

      // Sanal kısmın tarihleri
      for (let i = 0; i < scaledFake.length; i++) {
        const dayOffset = scaledFake.length - 1 - i;
        const date = new Date(oldestRealDate);
        date.setDate(date.getDate() - dayOffset);
        labels.push(date.toISOString());
        finalData.push(scaledFake[i]);
      }
    }

    // Gerçek verileri ekle
    recentRealPoints.forEach(p => {
      labels.push(p.timestamp.toISOString());
      finalData.push(p.price);
    });
  } else {
    // Gerçek veri yoksa: tamamen sanal seriyi kullan (eski davranış)
    const lastFakePrice = slicedDataRaw[slicedDataRaw.length - 1];
    const ratio = currentPrice / lastFakePrice;
    finalData = slicedDataRaw.map(p => parseFloat((p * ratio).toFixed(2)));

    for (let i = 0; i < finalData.length; i++) {
      const dayOffset = finalData.length - 1 - i;
      const date = new Date();
      date.setDate(now.getDate() - dayOffset);
      labels.push(date.toISOString());
    }
  }

  return { labels, data: finalData, labelFormat };
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
  const [cryptos, setCryptos] = useState([]);

  const [displayedAssets, setDisplayedAssets] = useState({});

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
  const [newNewsType, setNewNewsType] = useState('real'); // 'real' | 'fake'
  const [newsEffects, setNewsEffects] = useState({});

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStockForDetail, setSelectedStockForDetail] = useState(null);
  const [realHistory, setRealHistory] = useState([]); // Gerçek zamanlı fiyat geçmişi
  const [chartData, setChartData] = useState(null);
  const [chartTimeRange, setChartTimeRange] = useState('1A');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartLabelFormat, setChartLabelFormat] = useState('full');

  const [columnsModalVisible, setColumnsModalVisible] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnAuthor, setNewColumnAuthor] = useState('');
  const [newColumnContent, setNewColumnContent] = useState('');

  // Yönetim / Oturum & Analiz state'leri
  const [sessions, setSessions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionSchool, setNewSessionSchool] = useState('');
  const [newSessionDurationDays, setNewSessionDurationDays] = useState(30);
  const [assignUserEmail, setAssignUserEmail] = useState('');
  const [assignSessionId, setAssignSessionId] = useState('');
  const [selectedSessionUserEmail, setSelectedSessionUserEmail] = useState(null);

  // Hisse yönetimi formu
  const [stockFormTicker, setStockFormTicker] = useState('');
  const [stockFormName, setStockFormName] = useState('');
  const [stockFormPrice, setStockFormPrice] = useState('');

  // Hisse silme onayı
  const [deleteStockModalVisible, setDeleteStockModalVisible] = useState(false);
  const [stockToDelete, setStockToDelete] = useState(null);

  const [marketStatus, setMarketStatus] = useState({
    isScheduledOpen: false, manualOverride: null, volatilityMultiplier: 1.0, overrideExpiry: null,
  });

  // Slider için Yerel State
  const [volatility, setVolatility] = useState(1.0);

  const isMarketOpen = marketStatus.manualOverride !== null ? marketStatus.manualOverride : marketStatus.isScheduledOpen;

  const masterHistory = useMemo(() => {
    if (!selectedStockForDetail) return [];
    return generateMasterHistory(selectedStockForDetail.ticker);
  }, [selectedStockForDetail]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            const dateStr = context[0].label;
            const date = new Date(dateStr);
            return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#aaa',
          maxTicksLimit: 7,
          callback: function (val, index) {
            const dateStr = this.getLabelForValue(val);
            const date = new Date(dateStr);
            if (chartLabelFormat === 'year') {
              return date.getFullYear();
            } else {
              return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            }
          }
        },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#aaa' },
        grid: { color: '#333' }
      }
    },
    elements: { point: { radius: 0, hoverRadius: 5, hitRadius: 10 }, line: { borderWidth: 2 } }
  }), [chartLabelFormat]);

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

  useEffect(() => {
    if (!user) return;

    const checkAndCreateInitialData = async () => {
      if (user.isFounder) {
        const marketStatusDocRef = doc(db, 'status', 'market');
        const marketSnap = await getDoc(marketStatusDocRef);
        if (!marketSnap.exists()) {
          await setDoc(marketStatusDocRef, { isScheduledOpen: false, manualOverride: null, volatilityMultiplier: 1.0, overrideExpiry: null });
        }
      }
    };
    checkAndCreateInitialData();

    const unsubCompanies = onSnapshot(query(collection(db, 'marketData')), (snapshot) => {
      setCompanies(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, ticker: doc.id })));
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

    const unsubCryptos = onSnapshot(query(collection(db, 'cryptoData')), (snapshot) => {
      setCryptos(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, ticker: doc.id })));
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
        setMarketStatus(data);
        // DB'den gelen değeri slider'a yansıt
        if (data.volatilityMultiplier) {
          setVolatility(data.volatilityMultiplier);
        }
      }
    });

    // Kurucu için: oturumlar, işlemler ve kullanıcı listesi
    let unsubSessions = null;
    let unsubTransactions = null;
    let unsubUsers = null;

    if (user.isFounder) {
      unsubSessions = onSnapshot(
        collection(db, 'sessions'),
        (snapshot) => {
          setSessions(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
        }
      );

      unsubTransactions = onSnapshot(
        collection(db, 'transactions'),
        (snapshot) => {
          setTransactions(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
        }
      );

      unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          setAllUsers(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
        }
      );
    }

    return () => {
      unsubCompanies();
      unsubForex();
      unsubCryptos();
      unsubNews();
      unsubColumns();
      unsubMarket();
      if (unsubSessions) unsubSessions();
      if (unsubTransactions) unsubTransactions();
      if (unsubUsers) unsubUsers();
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
    setDetailModalVisible(false);
    const officialAsset = [...companies, ...forex, ...cryptos].find(a => a.ticker === asset.ticker);
    setSelectedAsset(officialAsset);
    setTradeAction(action);
    setTradeModalVisible(true);
    setTradeAmount('');
  };

  const executeTrade = async () => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) { showModal("Geçerli bir miktar girin."); return; }
    const totalCost = selectedAsset.price * amount;
    const userDocRef = doc(db, "users", user.email);

    let newBalance = user.balance;
    let newPortfolio = { ...user.portfolio };

    if (tradeAction === 'buy') {
      if (user.balance < totalCost) { showModal('Yetersiz bakiye!'); return; }
      newBalance = user.balance - totalCost;
      newPortfolio[selectedAsset.ticker] = (newPortfolio[selectedAsset.ticker] || 0) + amount;
    } else {
      const currentAmount = user.portfolio[selectedAsset.ticker] || 0;
      if (currentAmount < amount) { showModal('Yetersiz varlık!'); return; }
      newBalance = user.balance + totalCost;
      newPortfolio[selectedAsset.ticker] = currentAmount - amount;
      if (newPortfolio[selectedAsset.ticker] <= 0.00001) { delete newPortfolio[selectedAsset.ticker]; }
    }

    try {
      await updateDoc(userDocRef, { balance: newBalance, portfolio: newPortfolio });

      // İşlem logu: analiz için sakla
      await addDoc(collection(db, 'transactions'), {
        userEmail: user.email,
        action: tradeAction,
        ticker: selectedAsset.ticker,
        amount,
        price: selectedAsset.price,
        total: totalCost,
        isRealAsset: !!selectedAsset.isReal,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("İşlem kaydedilemedi:", err);
      showModal("İşlem sırasında bir hata oluştu.");
      return;
    }

    setTradeModalVisible(false);
    showModal("İşlem başarılı!");
  };

  const handleAddNews = async () => {
    if (!newNewsTitle || !newNewsContent) { showModal('Haber başlığı ve içeriği boş bırakılamaz.'); return; }

    const isFake = newNewsType === 'fake';
    const effectsPayload = {};

    // Beklenen etki (kurucunun seçtiği yön) ile gerçek uygulanacak etkiyi ayır
    companies.forEach(company => {
      const expected = newsEffects[company.ticker];
      if (expected !== undefined && !isNaN(expected)) {
        let expectedImpact = parseFloat(expected);
        if (expectedImpact > 20) expectedImpact = 20;
        if (expectedImpact < -20) expectedImpact = -20;

        let actualImpact;
        if (isFake) {
          // Yalan haber: yönü ters çevir
          const inverted = -expectedImpact;
          const noise = (Math.random() - 0.5) * Math.max(2, Math.abs(expectedImpact) * 0.5);
          actualImpact = inverted + noise;
        } else {
          // Gerçek haber: genel yön doğru olsun
          const noise = (Math.random() - 0.5) * Math.max(1, Math.abs(expectedImpact) * 0.3);
          actualImpact = expectedImpact + noise;
        }

        if (actualImpact > 25) actualImpact = 25;
        if (actualImpact < -25) actualImpact = -25;

        effectsPayload[company.ticker] = {
          expectedImpact,
          actualImpact,
        };
      }
    });

    await addDoc(collection(db, 'news'), {
      title: newNewsTitle,
      content: newNewsContent,
      isFake,
      manual: true,
      effects: effectsPayload,
      date: new Date().toISOString()
    });

    const batch = writeBatch(db);
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000;

    companies.forEach(company => {
      const perCompany = effectsPayload[company.ticker];
      if (perCompany) {
        const { actualImpact } = perCompany;
        const target = company.price * (1 + actualImpact / 100);
        const companyRef = doc(db, 'marketData', company.ticker);
        batch.update(companyRef, { targetPrice: Math.max(1, target), effectExpiry: Timestamp.fromMillis(expiryTime) });
      }
    });

    await batch.commit();
    setAddNewsModalVisible(false);
    setNewNewsTitle('');
    setNewNewsContent('');
    setNewsEffects({});
    setNewNewsType('real');
    showModal("Haber başarıyla yayınlandı ve piyasa etkileri uygulandı.");
  };

  const handleVoteNews = async (newsId, voteType) => {
    // voteType: 'real' | 'fake'
    if (!user || user.isFounder) return;
    try {
      const newsRef = doc(db, 'news', newsId);
      // We use dot notation to update a specific nested field (votes.userEmail)
      await updateDoc(newsRef, {
        [`votes.${user.email.replace(/\./g, '_')}`]: voteType
      });
      showModal("Oy kullanıldı!");
    } catch (err) {
      console.error("Oy kullanılamadı:", err);
      showModal("Oy kaydedilirken hata oluştu.");
    }
  };

  const handleDeleteNews = async (id) => { await deleteDoc(doc(db, 'news', id)); };

  const handleAddColumn = async () => {
    if (!newColumnTitle || !newColumnContent || !newColumnAuthor) { showModal("Tüm alanları doldurun."); return; }
    await addDoc(collection(db, 'columns'), { title: newColumnTitle, content: newColumnContent, author: newColumnAuthor, date: new Date().toISOString() });
    setNewColumnTitle(''); setNewColumnContent(''); setNewColumnAuthor('');
  };

  const handleDeleteColumn = async (id) => { await deleteDoc(doc(db, 'columns', id)); };

  // Bir sonraki otomatik AÇILIŞ (14:00) ve KAPANIŞ (19:00) zamanlarını hesapla
  const getNextOpenTime = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(14, 0, 0, 0);
    if (now.getHours() >= 14) {
      // Bugünün 14:00'ü geçtiyse yarının 14:00'ü
      next.setDate(next.getDate() + 1);
    }
    return next;
  };

  const getNextCloseTime = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(19, 0, 0, 0);
    if (now.getHours() >= 19) {
      // Bugünün 19:00'ı geçtiyse yarının 19:00'ı
      next.setDate(next.getDate() + 1);
    }
    return next;
  };

  const handleMarketOverrideToggle = async () => {
    try {
      const marketStatusRef = doc(db, 'status', 'market');

      if (isMarketOpen) {
        // Şu an AÇIK ise => manuel KAPAT, bir sonraki açılışa (14:00) kadar
        const until = getNextOpenTime();
        await setDoc(marketStatusRef, { manualOverride: false, overrideExpiry: Timestamp.fromDate(until) }, { merge: true });
      } else {
        // Şu an KAPALI ise => manuel AÇ, bir sonraki kapanışa (19:00) kadar
        const until = getNextCloseTime();
        await setDoc(marketStatusRef, { manualOverride: true, overrideExpiry: Timestamp.fromDate(until) }, { merge: true });
      }
    } catch (err) {
      console.error("Piyasa durumu değiştirilemedi:", err);
      showModal("Piyasa durumu değiştirilirken hata oluştu.");
    }
  };

  const handleMarketAutoMode = async () => {
    try {
      await setDoc(doc(db, 'status', 'market'), { manualOverride: null, overrideExpiry: null }, { merge: true });
    } catch (err) {
      console.error("Otomatik moda dönülemedi:", err);
      showModal("Otomatik moda dönülürken hata oluştu.");
    }
  };

  // --- OTURUM YÖNETİMİ & ANALİZ ---
  const handleCreateSession = async () => {
    if (!newSessionName || !newSessionSchool || !newSessionDurationDays) {
      showModal("Oturum adı, okul ve süre (gün) doldurulmalıdır.");
      return;
    }
    const days = parseInt(newSessionDurationDays, 10);
    if (isNaN(days) || days <= 0) {
      showModal("Süre (gün) için geçerli bir sayı girin.");
      return;
    }
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    try {
      await addDoc(collection(db, 'sessions'), {
        name: newSessionName,
        school: newSessionSchool,
        durationDays: days,
        startAt: Timestamp.fromDate(now),
        endAt: Timestamp.fromDate(end),
        createdAt: Timestamp.fromDate(new Date()),
        participantEmails: [],
        status: 'active',
      });
      setNewSessionName('');
      setNewSessionSchool('');
      setNewSessionDurationDays(30);
    } catch (err) {
      console.error("Oturum oluşturulamadı:", err);
      showModal("Oturum oluşturulurken hata oluştu.");
    }
  };

  const handleAssignUserToSession = async () => {
    if (!assignUserEmail || !assignSessionId) {
      showModal("Lütfen bir kullanıcı ve bir oturum seçin.");
      return;
    }
    try {
      const sessionRef = doc(db, 'sessions', assignSessionId);
      await updateDoc(sessionRef, {
        participantEmails: arrayUnion(assignUserEmail),
      });
      showModal("Kullanıcı oturuma eklendi.");
    } catch (err) {
      console.error("Kullanıcı oturuma eklenemedi:", err);
      showModal("Kullanıcı oturuma eklenirken hata oluştu.");
    }
  };

  const getSessionTimeRange = (session) => {
    if (!session) return { start: null, end: null };
    const start = session.startAt && session.startAt.toDate ? session.startAt.toDate() : new Date(session.startAt);
    const end = session.endAt && session.endAt.toDate ? session.endAt.toDate() : new Date(session.endAt);
    return { start, end };
  };

  const computeSessionSummary = (session) => {
    if (!session) return null;
    const { start, end } = getSessionTimeRange(session);
    if (!start || !end) return null;

    const participantEmails = session.participantEmails || [];

    const sessionTransactions = transactions.filter(tx => {
      if (!participantEmails.includes(tx.userEmail)) return false;
      const t = new Date(tx.timestamp);
      return t >= start && t <= end;
    });

    const newsInRange = news.filter(n => {
      const d = new Date(n.date);
      return d >= start && d <= end;
    });

    const realNewsCount = newsInRange.filter(n => !n.isFake).length;
    const fakeNewsCount = newsInRange.filter(n => n.isFake).length;

    // Katılımcıların güncel toplam varlıkları ve yaklaşık kârları
    const allAssets = [...companies, ...forex, ...cryptos];
    const participantStats = participantEmails.map(email => {
      const u = allUsers.find(usr => usr.email === email);
      if (!u) return { email, totalAssets: 0, profit: 0 };

      const portfolio = u.portfolio || {};
      const balance = u.balance || 0;
      const portfolioValue = Object.keys(portfolio).reduce((sum, ticker) => {
        const asset = allAssets.find(a => a.ticker === ticker);
        if (!asset) return sum;
        return sum + (asset.price * portfolio[ticker]);
      }, 0);
      const totalAssets = balance + portfolioValue;
      const initialBalance = u.initialBalance || (u.isFounder ? 1000000 : 100000);
      const profit = totalAssets - initialBalance;
      return { email, totalAssets, profit };
    });

    participantStats.sort((a, b) => b.profit - a.profit);

    const uniqueTraders = new Set(sessionTransactions.map(tx => tx.userEmail));
    const totalVolume = sessionTransactions.reduce((sum, tx) => sum + (tx.total || 0), 0);

    // Haber anket analizi için yardımcı
    const newsStats = newsInRange.map(n => {
      const votes = n.votes || {};
      const studentEmails = Object.keys(votes);
      const totalVotes = studentEmails.length;
      const realVotes = studentEmails.filter(e => votes[e] === 'real').length;
      const fakeVotes = studentEmails.filter(e => votes[e] === 'fake').length;
      return {
        id: n.id,
        title: n.title,
        isFake: n.isFake,
        totalVotes,
        realVotes,
        fakeVotes
      }
    });

    return {
      participantCount: participantEmails.length,
      totalTransactions: sessionTransactions.length,
      uniqueTraderCount: uniqueTraders.size,
      totalVolume,
      realNewsCount,
      fakeNewsCount,
      participantStats,
      newsStats
    };
  };

  // --- HİSSE YÖNETİMİ ---
  const handleEditStock = (ticker) => {
    const asset = companies.find(c => c.ticker === ticker);
    if (!asset) return;
    setStockFormTicker(asset.ticker);
    setStockFormName(asset.name || '');
    setStockFormPrice(asset.price != null ? String(asset.price) : '');
  };

  const handleResetStockForm = () => {
    setStockFormTicker('');
    setStockFormName('');
    setStockFormPrice('');
  };

  const handleSaveStock = async () => {
    const tickerRaw = stockFormTicker.trim();
    const name = stockFormName.trim();
    const priceNum = parseFloat(stockFormPrice);

    if (!tickerRaw || !name || isNaN(priceNum) || priceNum <= 0) {
      showModal("Hisse kısaltması, isim ve geçerli bir başlangıç fiyatı girin.");
      return;
    }

    const ticker = tickerRaw.toUpperCase();

    try {
      await setDoc(
        doc(db, 'marketData', ticker),
        {
          name,
          ticker,
          price: parseFloat(priceNum.toFixed(2)),
          change: 0,
          lastChangePercent: 0,
          isReal: false,
        },
        { merge: true }
      );
      handleResetStockForm();
      showModal("Hisse başarıyla kaydedildi.");
    } catch (err) {
      console.error("Hisse kaydedilemedi:", err);
      showModal("Hisse kaydedilirken bir hata oluştu.");
    }
  };

  const confirmDeleteStock = (asset) => {
    setStockToDelete(asset);
    setDeleteStockModalVisible(true);
  };

  const executeDeleteStock = async () => {
    if (!stockToDelete) return;
    try {
      await deleteDoc(doc(db, 'marketData', stockToDelete.ticker));
      setDeleteStockModalVisible(false);
      setStockToDelete(null);
      showModal("Hisse başarıyla silindi.");
    } catch (err) {
      console.error("Hisse silinemedi:", err);
      showModal("Hisse silinirken bir hata oluştu.");
    }
  };

  const cancelDeleteStock = () => {
    setDeleteStockModalVisible(false);
    setStockToDelete(null);
  };

  // --- SLIDER HANDLER ---
  const handleVolatilityChange = (e) => {
    let newVal = parseFloat(e.target.value);
    if (isNaN(newVal)) newVal = 1.0;
    // Güvenlik için sınırla
    if (newVal < 0.2) newVal = 0.2;
    if (newVal > 1.5) newVal = 1.5;
    setVolatility(newVal); // Anlık olarak UI'ı güncelle
  };

  // Slider'ı bıraktığında veritabanını güncelle
  const handleVolatilityCommit = async () => {
    try {
      await updateDoc(doc(db, 'status', 'market'), { volatilityMultiplier: volatility });
    } catch (err) {
      console.error("Volatilite güncellenemedi:", err);
    }
  }

  const handleStockClick = (asset) => {
    if (!asset) return;
    setSelectedStockForDetail(asset);
    setDetailModalVisible(true);
  };

  // Seçili hisse için gerçek zamanlı history'yi dinle
  useEffect(() => {
    if (!selectedStockForDetail || !selectedStockForDetail.ticker) {
      setRealHistory([]);
      return;
    }

    const historyRef = collection(db, 'marketData', selectedStockForDetail.ticker, 'history');
    const unsubscribe = onSnapshot(
      query(historyRef, orderBy('timestamp', 'desc')),
      (snapshot) => {
        const historyData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setRealHistory(historyData);
      },
      (error) => {
        console.error("History okuma hatası:", error);
        setRealHistory([]);
      }
    );

    return () => unsubscribe();
  }, [selectedStockForDetail]);

  useEffect(() => {
    if (selectedStockForDetail && masterHistory.length > 0) {
      setIsChartLoading(true);
      const { labels, data, labelFormat } = getRangeData(masterHistory, chartTimeRange, selectedStockForDetail.price, realHistory);
      setChartLabelFormat(labelFormat);
      setChartData({
        labels: labels,
        datasets: [{
          label: 'Fiyat (₺)',
          data: data,
          borderColor: 'rgb(0, 123, 255)',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 6
        }]
      });
      setIsChartLoading(false);
    }
  }, [selectedStockForDetail, chartTimeRange, masterHistory, realHistory]);

  const renderAuthScreens = () => (
    <div style={styles.authContainer}>
      <h1 style={styles.authTitle}>Borsa Simülasyonu</h1>
      <input style={styles.input} placeholder="E-posta Adresi" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input style={styles.input} placeholder="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {screen === 'register' && (<input style={styles.input} placeholder="Şifre Tekrar" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />)}
      <button style={styles.button} onClick={screen === 'login' ? handleLogin : handleRegister}> {screen === 'login' ? 'Giriş Yap' : 'Kayıt Ol'} </button>
      <p style={styles.switchText} onClick={() => setScreen(screen === 'login' ? 'register' : 'login')}> {screen === 'login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'} </p>
      <p style={{ marginTop: 30, color: '#666', fontSize: 12 }}>Kurucu Girişi: kurucu@borsa.sim (Şifrenizi siz belirleyin)</p>
    </div>
  );

  const AssetRow = ({ asset }) => {
    const changeAmount = asset.change || 0;
    const prevPrice = asset.price - changeAmount;
    const percentageChange = prevPrice !== 0 ? (changeAmount / prevPrice) * 100 : 0;
    const priceChangeStyle = changeAmount >= 0 ? styles.priceUp : styles.priceDown;
    const tradeButtonsDisabled = !isMarketOpen;

    return (
      <div
        key={asset.ticker}
        style={styles.stockRow}
        onClick={() => handleStockClick(asset)}
      >
        <div style={styles.stockInfo}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={styles.stockTicker}>{asset.ticker}</p>
          </div>
          <p style={styles.stockName}>{asset.name}</p>
        </div>
        <div style={styles.stockPriceContainer}>
          <p style={styles.stockPrice}>₺{asset.price.toFixed(2)}</p>
          <span style={{ ...styles.stockChange, ...priceChangeStyle }}>
            {percentageChange.toFixed(2)}%
          </span>
        </div>
        <div style={styles.stockActions}>
          <button
            disabled={tradeButtonsDisabled}
            style={{
              ...styles.tradeButton,
              ...styles.buyButton,
              ...(tradeButtonsDisabled && styles.tradeButtonDisabled),
            }}
            onClick={(e) => {
              e.stopPropagation();
              openTradeModal(asset, 'buy');
            }}
          >
            Al
          </button>
          <button
            disabled={tradeButtonsDisabled}
            style={{
              ...styles.tradeButton,
              ...styles.sellButton,
              ...(tradeButtonsDisabled && styles.tradeButtonDisabled),
            }}
            onClick={(e) => {
              e.stopPropagation();
              openTradeModal(asset, 'sell');
            }}
          >
            Sat
          </button>
        </div>
      </div>
    );
  };

  const renderMarket = () => (<div style={{ paddingBottom: 20 }}> {companies.map(company => <AssetRow key={company.ticker} asset={company} />)} </div>);
  const renderForex = () => (<div style={{ paddingBottom: 20 }}> {forex.map(fx => <AssetRow key={fx.ticker} asset={fx} />)} </div>);
  const renderCrypto = () => (<div style={{ paddingBottom: 20 }}> {cryptos.map(crypto => <AssetRow key={crypto.ticker} asset={crypto} />)} </div>);

  const renderPortfolio = () => {
    if (!user || !user.portfolio) return null;
    const allAssets = [...companies, ...forex, ...cryptos];
    const portfolioItems = Object.keys(user.portfolio);
    if (portfolioItems.length === 0) {
      return <div style={styles.centerMessage}><p style={styles.centerMessageText}>Portföyünüzde hiç varlık yok.</p></div>;
    }
    return (<div style={{ paddingBottom: 20 }}> {portfolioItems.map(ticker => { const asset = allAssets.find(a => a.ticker === ticker); if (!asset) return null; const amount = user.portfolio[ticker]; const currentValue = asset.price * amount; return (<div key={ticker} style={styles.portfolioRow}> <div> <p style={styles.stockTicker}>{ticker}</p> <p style={styles.stockName}>{amount.toFixed(4)} Adet</p> </div> <div style={{ textAlign: 'right' }}> <p style={styles.stockPrice}>₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p> <p style={styles.stockName}>Birim Fiyat: ₺{asset.price.toFixed(2)}</p> </div> </div>); })} </div>);
  };

  const renderNews = () => (
    <div style={{ paddingBottom: 20 }}>
      <div style={styles.newsHeader}>
        <h2 style={{ margin: '15px 0' }}>Haberler</h2>
        <button style={styles.secondaryButton} onClick={() => setColumnsModalVisible(true)}>Köşe Yazıları</button>
      </div>
      {user.isFounder && (
        <div style={styles.addNewsButton} onClick={() => setAddNewsModalVisible(true)}>
          + Yeni Haber Ekle
        </div>
      )}
      {news.map(item => {
        const safeEmail = user.email.replace(/\./g, '_');
        const userVote = item.votes ? item.votes[safeEmail] : null;

        return (
          <div key={item.id} style={styles.newsCard}>
            {user.isFounder && (
              <button style={styles.deleteButton} onClick={() => handleDeleteNews(item.id)}>
                <TrashIcon />
              </button>
            )}
            <h3 style={styles.newsTitle}>{item.title}</h3>
            <p style={styles.newsContent}>{item.content}</p>
            <p style={styles.newsDate}>{new Date(item.date).toLocaleString('tr-TR')}</p>

            {user.isFounder ? (
              typeof item.isFake === 'boolean' && (
                <p style={{ fontSize: 11, color: item.isFake ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                  {item.isFake ? 'SİSTEM: YALAN HABER' : 'SİSTEM: GERÇEK HABER'}
                </p>
              )
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #28a745',
                    backgroundColor: userVote === 'real' ? '#28a745' : 'transparent',
                    color: userVote === 'real' ? '#fff' : '#28a745',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleVoteNews(item.id, 'real')}
                >
                  Gerçek Haber
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #dc3545',
                    backgroundColor: userVote === 'fake' ? '#dc3545' : 'transparent',
                    color: userVote === 'fake' ? '#fff' : '#dc3545',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleVoteNews(item.id, 'fake')}
                >
                  Yalan Haber
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderAdmin = () => {
    const selectedSession = sessions.find(s => s.id === selectedSessionId) || null;
    const summary = selectedSession ? computeSessionSummary(selectedSession) : null;

    const unassignedUsers = allUsers.filter(u => {
      if (u.isFounder) return false;
      const email = u.email;
      if (!email) return false;
      // Hiçbir oturumun participantEmails listesinde olmayanlar
      const inAnySession = sessions.some(s => (s.participantEmails || []).includes(email));
      return !inAnySession;
    });

    const sessionParticipants = selectedSession ? (selectedSession.participantEmails || []) : [];

    const getUserLabel = (email) => {
      const u = allUsers.find(x => x.email === email);
      if (!u) return email;
      return `${email}`;
    };

    const getSessionLabel = (s) => {
      const { start, end } = getSessionTimeRange(s);
      const range = start && end ? `${start.toLocaleDateString('tr-TR')} - ${end.toLocaleDateString('tr-TR')}` : '';
      return `${s.school} - ${s.name} (${range})`;
    };

    const currentSessionForAssign = sessions.find(s => s.id === assignSessionId) || null;

    const selectedUserForDetail = selectedSessionUserEmail
      ? allUsers.find(u => u.email === selectedSessionUserEmail)
      : null;

    let selectedUserTx = [];
    if (selectedSession && selectedSessionUserEmail) {
      const { start, end } = getSessionTimeRange(selectedSession);
      selectedUserTx = transactions.filter(tx => {
        if (tx.userEmail !== selectedSessionUserEmail) return false;
        const t = new Date(tx.timestamp);
        return t >= start && t <= end;
      });
    }

    return (
      <div style={{ padding: 20, paddingBottom: 80 }}>
        <h2 style={{ marginBottom: 10 }}>Yönetim & Analiz</h2>
        <p style={{ ...styles.subBalanceText, marginBottom: 20 }}>
          Buradan okullara göre oturumlar oluşturabilir, öğrencileri oturumlara atayabilir ve genel performanslarını inceleyebilirsiniz.
        </p>

        <div style={{ marginBottom: 25, padding: 15, backgroundColor: '#1e1e1e', borderRadius: 10 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Yeni Oturum Oluştur</h3>
          <input
            style={styles.input}
            placeholder="Okul Adı (örn. X Lisesi)"
            value={newSessionSchool}
            onChange={(e) => setNewSessionSchool(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Oturum Adı (örn. 1. Dönem Simülasyonu)"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Süre (gün)"
            value={newSessionDurationDays}
            onChange={(e) => setNewSessionDurationDays(e.target.value)}
          />
          <button style={styles.button} onClick={handleCreateSession}>Oturumu Başlat</button>
        </div>

        <div style={{ marginBottom: 25, padding: 15, backgroundColor: '#1e1e1e', borderRadius: 10 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Hisse Yönetimi</h3>
          <p style={{ ...styles.modalInfo, marginBottom: 10 }}>
            Buradan yeni simülasyon hisseleri ekleyebilir veya mevcutların adını/fiyatını güncelleyebilirsin.
            Eklediğin hisseler otomatik olarak piyasa motoruna dahil olur.
          </p>

          <div style={{ marginBottom: 10 }}>
            <input
              style={styles.input}
              placeholder="Hisse Kısaltması (örn. TKNDV)"
              value={stockFormTicker}
              onChange={(e) => setStockFormTicker(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="Hisse Adı"
              value={stockFormName}
              onChange={(e) => setStockFormName(e.target.value)}
            />
            <input
              style={styles.input}
              type="number"
              placeholder="Başlangıç Fiyatı"
              value={stockFormPrice}
              onChange={(e) => setStockFormPrice(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...styles.button, flex: 1 }} onClick={handleSaveStock}>
                Kaydet
              </button>
              <button
                style={{ ...styles.secondaryButton, flex: 1, textAlign: 'center' }}
                onClick={handleResetStockForm}
              >
                Temizle
              </button>
            </div>
          </div>

          <h4 style={{ marginTop: 20, marginBottom: 8 }}>Mevcut Hisseler</h4>
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {companies.map(c => (
              <div
                key={c.ticker}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: '1px solid #2a2a2a',
                  fontSize: 13,
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold' }}>{c.ticker}</span>{' '}
                  <span style={{ color: '#aaa' }}>{c.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>₺{c.price.toFixed(2)}</span>
                  <button
                    style={{ ...styles.secondaryButton, padding: '4px 8px', fontSize: 11 }}
                    onClick={() => handleEditStock(c.ticker)}
                  >
                    Düzenle
                  </button>
                  <button
                    style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '0 4px' }}
                    onClick={() => confirmDeleteStock(c)}
                    title="Sil"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 25, padding: 15, backgroundColor: '#1e1e1e', borderRadius: 10 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Oturumlar</h3>
          {sessions.length === 0 && (
            <p style={styles.centerMessageText}>Henüz oluşturulmuş bir oturum yok.</p>
          )}
          {sessions.map(s => {
            const { start, end } = getSessionTimeRange(s);
            const label = getSessionLabel(s);
            return (
              <div key={s.id} style={{ marginBottom: 10, padding: 10, borderRadius: 8, backgroundColor: selectedSessionId === s.id ? '#333' : '#252525', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>
                    Katılımcı: {(s.participantEmails || []).length} kişi
                  </p>
                </div>
                <button
                  style={{ ...styles.secondaryButton, padding: '6px 10px', fontSize: 12 }}
                  onClick={() => setSelectedSessionId(s.id)}
                >
                  {selectedSessionId === s.id ? 'Seçili' : 'Seç'}
                </button>
              </div>
            );
          })}
        </div>

        {selectedSession && summary && (
          <div style={{ marginBottom: 25, padding: 15, backgroundColor: '#1e1e1e', borderRadius: 10 }}>
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Oturum Özeti</h3>
            <p style={styles.modalInfo}>Oturum: {getSessionLabel(selectedSession)}</p>
            <p style={styles.modalInfo}>Katılımcı Sayısı: {summary.participantCount}</p>
            <p style={styles.modalInfo}>Toplam İşlem Sayısı: {summary.totalTransactions}</p>
            <p style={styles.modalInfo}>İşlem Yapan Öğrenci Sayısı: {summary.uniqueTraderCount}</p>
            <p style={styles.modalInfo}>Toplam İşlem Hacmi: ₺{summary.totalVolume.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</p>
            <p style={styles.modalInfo}>Gerçek Haber Sayısı: {summary.realNewsCount}</p>
            <p style={styles.modalInfo}>Yalan Haber Sayısı: {summary.fakeNewsCount}</p>

            <h4 style={{ marginTop: 15, marginBottom: 8 }}>Haber Oylamaları</h4>
            {summary.newsStats.length === 0 && (
              <p style={styles.centerMessageText}>Bu oturum sürecinde haber yok.</p>
            )}
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {summary.newsStats.map(ns => {
                const percentReal = ns.totalVotes > 0 ? ((ns.realVotes / ns.totalVotes) * 100).toFixed(0) : 0;
                const percentFake = ns.totalVotes > 0 ? ((ns.fakeVotes / ns.totalVotes) * 100).toFixed(0) : 0;
                return (
                  <div key={ns.id} style={{ padding: '8px 0', borderBottom: '1px solid #333', fontSize: 13 }}>
                    <div style={{ fontWeight: 'bold' }}>{ns.title}</div>
                    <div style={{ color: '#aaa', fontSize: 11, marginBottom: 4 }}>
                      Durum: <span style={{ color: ns.isFake ? '#dc3545' : '#28a745' }}>{ns.isFake ? 'YALAN' : 'GERÇEK'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ color: '#28a745' }}>Gerçek Diyenler: {ns.realVotes} (%{percentReal})</span>
                      <span style={{ color: '#dc3545' }}>Yalan Diyenler: {ns.fakeVotes} (%{percentFake})</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <h4 style={{ marginTop: 15, marginBottom: 8 }}>Sıralama (En çok kar edenler)</h4>
            {summary.participantStats.length === 0 && (
              <p style={styles.centerMessageText}>Bu oturum için henüz veri yok.</p>
            )}
            {summary.participantStats.map((ps, idx) => (
              <div
                key={ps.email}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #2a2a2a', cursor: 'pointer' }}
                onClick={() => setSelectedSessionUserEmail(ps.email)}
              >
                <span style={{ fontSize: 13 }}>{idx + 1}. {getUserLabel(ps.email)}</span>
                <span style={{ fontSize: 13 }}>
                  Toplam: ₺{ps.totalAssets.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} {' '}
                  ({ps.profit >= 0 ? '+' : ''}{ps.profit.toLocaleString('tr-TR', { maximumFractionDigits: 2 })})
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 25, padding: 15, backgroundColor: '#1e1e1e', borderRadius: 10 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Öğrenci Oturuma Ekle</h3>
          <select
            style={{ ...styles.input, maxWidth: '100%' }}
            value={assignUserEmail}
            onChange={(e) => setAssignUserEmail(e.target.value)}
          >
            <option value="">Kullanıcı Seç</option>
            {unassignedUsers.map(u => (
              <option key={u.email} value={u.email}>{u.email}</option>
            ))}
          </select>

          <select
            style={{ ...styles.input, maxWidth: '100%' }}
            value={assignSessionId}
            onChange={(e) => setAssignSessionId(e.target.value)}
          >
            <option value="">Oturum Seç</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>{getSessionLabel(s)}</option>
            ))}
          </select>

          <button style={styles.button} onClick={handleAssignUserToSession}>Ata</button>
        </div>

        {selectedSession && selectedSessionUserEmail && selectedUserForDetail && (
          <div style={styles.modalOverlay} onClick={() => setSelectedSessionUserEmail(null)}>
            <div style={styles.detailModalView} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={styles.modalTitle}>{selectedSessionUserEmail}</h2>
                <button
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
                  onClick={() => setSelectedSessionUserEmail(null)}
                >
                  ×
                </button>
              </div>
              <p style={styles.modalInfo}>Bağlı Olduğu Oturum: {getSessionLabel(selectedSession)}</p>
              <p style={{ ...styles.modalInfo, marginTop: 10 }}>İşlem Geçmişi:</p>
              {selectedUserTx.length === 0 && (
                <p style={styles.centerMessageText}>Bu oturumda bu kullanıcı için işlem kaydı yok.</p>
              )}
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {selectedUserTx.map(tx => (
                  <div key={tx.id} style={{ padding: '6px 0', borderBottom: '1px solid #3a3a3a', fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{tx.action === 'buy' ? 'ALIM' : 'SATIM'} - {tx.ticker}</span>
                      <span>₺{tx.total.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                      <span>{tx.amount} adet x ₺{tx.price.toFixed(2)}</span>
                      <span>{new Date(tx.timestamp).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAppContent = () => {
    let content;
    switch (activeTab) {
      case 'doviz': content = renderForex(); break;
      case 'kripto': content = renderCrypto(); break;
      case 'portfoy': content = renderPortfolio(); break;
      case 'haberler': content = renderNews(); break;
      case 'yonetim': content = user.isFounder ? renderAdmin() : renderMarket(); break;
      default: content = renderMarket();
    }
    const allAssets = [...companies, ...forex, ...cryptos];
    const portfolioValue = (user && user.portfolio && allAssets.length > 0) ? Object.keys(user.portfolio).reduce((total, ticker) => { const asset = allAssets.find(a => a.ticker === ticker); return total + (asset ? asset.price * user.portfolio[ticker] : 0); }, 0) : 0;
    const totalAssets = (user?.balance || 0) + portfolioValue;
    let overrideButtonText;
    if (marketStatus.manualOverride !== null) {
      overrideButtonText = marketStatus.manualOverride ? "MANÜEL AÇIK" : "MANÜEL KAPALI";
    } else {
      overrideButtonText = "OTOMATİK";
    }
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <header style={styles.header}>
          <div>
            <p style={styles.headerText}>Toplam Varlık {user.isFounder && '(Yönetici)'}</p>
            <p style={styles.balanceText}>₺{totalAssets.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p style={styles.subBalanceText}>Nakit: ₺{(user?.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.marketStatusContainer}>
              <div style={{ ...styles.marketStatusIndicator, ...(isMarketOpen ? styles.marketOpen : styles.marketClosed) }} />
              <span style={styles.marketStatusText}>{isMarketOpen ? 'AÇIK' : 'KAPALI'}</span>
            </div>
            {user.isFounder && (
              <>
                <div style={styles.sliderContainer}>
                  <label style={styles.sliderLabel}>Piyasa Hızı: {volatility.toFixed(1)}x</label>
                  <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.1"
                    value={volatility}
                    onChange={handleVolatilityChange}
                    onMouseUp={handleVolatilityCommit}
                    onTouchEnd={handleVolatilityCommit}
                    style={styles.sliderInput}
                  />
                </div>
                <button style={styles.overrideButton} onClick={handleMarketOverrideToggle}>
                  {isMarketOpen ? 'ŞİMDİ KAPAT' : 'ŞİMDİ AÇ'}
                </button>
                <button style={styles.overrideButton} onClick={handleMarketAutoMode}>
                  Otomatik Ayara Dön
                </button>
              </>
            )}
            <span onClick={handleLogout} style={styles.logoutText}>Çıkış</span>
          </div>
        </header>
        <main style={styles.contentArea}>{content}</main>
        <nav style={styles.navBar}>
          <button style={styles.navButton} onClick={() => setActiveTab('piyasa')}>
            <span style={{ ...styles.navText, ...(activeTab === 'piyasa' && styles.navTextActive) }}>Piyasa</span>
          </button>
          <button style={styles.navButton} onClick={() => setActiveTab('doviz')}>
            <span style={{ ...styles.navText, ...(activeTab === 'doviz' && styles.navTextActive) }}>Döviz</span>
          </button>
          <button style={styles.navButton} onClick={() => setActiveTab('kripto')}>
            <span style={{ ...styles.navText, ...(activeTab === 'kripto' && styles.navTextActive) }}>Kripto</span>
          </button>
          <button style={styles.navButton} onClick={() => setActiveTab('portfoy')}>
            <span style={{ ...styles.navText, ...(activeTab === 'portfoy' && styles.navTextActive) }}>Portföy</span>
          </button>
          <button style={styles.navButton} onClick={() => setActiveTab('haberler')}>
            <span style={{ ...styles.navText, ...(activeTab === 'haberler' && styles.navTextActive) }}>Haberler</span>
          </button>
          {user.isFounder && (
            <button style={styles.navButton} onClick={() => setActiveTab('yonetim')}>
              <span style={{ ...styles.navText, ...(activeTab === 'yonetim' && styles.navTextActive) }}>Yönetim</span>
            </button>
          )}
        </nav>
      </div>
    );
  };

  if (user === undefined) {
    return <div style={{ ...styles.container, ...styles.authContainer, fontSize: 20 }}>Yükleniyor...</div>
  }

  return (<div style={styles.container}> {user === null ? renderAuthScreens() : renderAppContent()}
    {modalVisible && (<div style={styles.modalOverlay}> <div style={styles.modalView}> <p style={styles.modalText}>{modalMessage}</p> <button style={{ ...styles.button, width: 'auto', padding: '10px 30px' }} onClick={() => setModalVisible(false)}> Tamam </button> </div> </div>)}
    {tradeModalVisible && (<div style={styles.modalOverlay}> <div style={styles.modalView}> <h2 style={styles.modalTitle}>{selectedAsset?.ticker} {tradeAction === 'buy' ? 'Al' : 'Sat'}</h2> <p style={styles.modalInfo}>Fiyat: ₺{selectedAsset?.price.toFixed(2)}</p> <p style={styles.modalInfo}>Nakit Bakiye: ₺{user?.balance.toFixed(2)}</p> {tradeAction === 'sell' && <p style={styles.modalInfo}>Sahip Olunan: {user?.portfolio[selectedAsset?.ticker] || 0} Adet</p>} <input style={styles.input} placeholder="Adet Girin" type="number" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} /> <div style={styles.modalButtonContainer}> <button style={{ ...styles.modalButton, backgroundColor: '#555' }} onClick={() => setTradeModalVisible(false)}> İptal </button> <button style={{ ...styles.modalButton, backgroundColor: tradeAction === 'buy' ? '#28a745' : '#dc3545' }} onClick={executeTrade}> Onayla </button> </div> </div> </div>)}
    {deleteStockModalVisible && stockToDelete && (
      <div style={styles.modalOverlay}>
        <div style={styles.modalView}>
          <h2 style={{ ...styles.modalTitle, color: '#dc3545' }}>Hisse Silinecek!</h2>
          <p style={{ ...styles.modalText, color: '#fff' }}>{stockToDelete.name} ({stockToDelete.ticker}) Hissesini silmek istediğinizden emin misiniz?</p>
          <div style={styles.modalButtonContainer}>
            <button style={{ ...styles.modalButton, backgroundColor: '#555' }} onClick={cancelDeleteStock}> Hayır </button>
            <button style={{ ...styles.modalButton, backgroundColor: '#dc3545' }} onClick={executeDeleteStock}> Evet </button>
          </div>
        </div>
      </div>
    )}
    {addNewsModalVisible && (
      <div style={styles.modalOverlay}>
        <div style={styles.modalView}>
          <h2 style={styles.modalTitle}>Yeni Haber Ekle</h2>
          <input
            style={styles.input}
            placeholder="Haber Başlığı"
            value={newNewsTitle}
            onChange={(e) => setNewNewsTitle(e.target.value)}
          />
          <textarea
            style={{ ...styles.input, height: 80, resize: 'vertical' }}
            placeholder="Haber İçeriği"
            value={newNewsContent}
            onChange={(e) => setNewNewsContent(e.target.value)}
          />

          <div style={{ marginBottom: 10 }}>
            <label style={{ ...styles.sliderLabel, marginBottom: 5 }}>Haber Türü</label>
            <select
              style={{ ...styles.input, maxWidth: '200px' }}
              value={newNewsType}
              onChange={(e) => setNewNewsType(e.target.value)}
            >
              <option value="real">Gerçek Haber</option>
              <option value="fake">Yalan Haber</option>
            </select>
          </div>

          <h3 style={styles.stockEffectTitle}>Hisse Senedi Etkileri (24 Saat)</h3>
          <p style={{ ...styles.modalInfo, marginBottom: 10 }}>
            Buraya girdiğiniz yüzde değerler, öğrencilerin haberden beklemesini istediğiniz yönü ifade eder.
            Yalan haberlerde sistem bu beklentinin tersine hareket ettirecektir.
          </p>
          <div style={styles.effectsContainer}>
            {companies.map(company => (
              <div key={company.ticker} style={styles.effectRow}>
                <span style={{ flex: 1 }}>{company.ticker}</span>
                <input
                  type="number"
                  placeholder="Etki %"
                  style={styles.effectInput}
                  value={newsEffects[company.ticker] ?? ''}
                  onChange={(e) => {
                    const newEffects = { ...newsEffects };
                    const value = e.target.value;
                    if (value === '') {
                      delete newEffects[company.ticker];
                    } else {
                      newEffects[company.ticker] = parseFloat(value);
                    }
                    setNewsEffects(newEffects);
                  }}
                />
              </div>
            ))}
          </div>
          <div style={styles.modalButtonContainer}>
            <button
              style={{ ...styles.modalButton, backgroundColor: '#555' }}
              onClick={() => setAddNewsModalVisible(false)}
            >
              İptal
            </button>
            <button
              style={{ ...styles.modalButton, backgroundColor: '#007bff' }}
              onClick={handleAddNews}
            >
              Yayınla ve Etki Et
            </button>
          </div>
        </div>
      </div>
    )}
    {columnsModalVisible && (<div style={styles.modalOverlay}> <div style={styles.columnsModalView}> <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> <h2 style={styles.modalTitle}>Köşe Yazıları</h2> <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }} onClick={() => setColumnsModalVisible(false)}>×</button> </div> {user.isFounder && (<div style={{ padding: '10px', border: '1px solid #444', borderRadius: '10px', marginBottom: '20px' }}> <h3 style={{ marginTop: 0 }}>Yeni Yazı Ekle</h3> <input style={styles.input} placeholder="Yazı Başlığı" value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} /> <input style={styles.input} placeholder="Yazar Adı" value={newColumnAuthor} onChange={(e) => setNewColumnAuthor(e.target.value)} /> <textarea style={{ ...styles.input, height: '100px', resize: 'vertical' }} placeholder="İçerik" value={newColumnContent} onChange={(e) => setNewColumnContent(e.target.value)} /> <button style={styles.button} onClick={handleAddColumn}>Ekle</button> </div>)} <div style={{ flex: 1, overflowY: 'auto' }}> {columns.map(item => (<div key={item.id} style={styles.newsCard}> {user.isFounder && <button style={styles.deleteButton} onClick={() => handleDeleteColumn(item.id)}><TrashIcon /></button>} <h3 style={styles.newsTitle}>{item.title}</h3> <p style={{ fontSize: 12, color: '#007bff', margin: '5px 0' }}>{item.author}</p> <p style={styles.newsContent}>{item.content}</p> <p style={styles.newsDate}>{new Date(item.date).toLocaleString('tr-TR')}</p> </div>))} </div> </div> </div>)}

    {detailModalVisible && selectedStockForDetail && (
      <div style={styles.modalOverlay} onClick={() => setDetailModalVisible(false)}>
        <div style={styles.detailModalView} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={styles.modalTitle}>{selectedStockForDetail.name} ({selectedStockForDetail.ticker})</h2>
            <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }} onClick={() => setDetailModalVisible(false)}>×</button>
          </div>
          <p style={styles.stockPrice}>Güncel Fiyat: ₺{selectedStockForDetail.price.toFixed(2)}</p>
          <div style={styles.chartContainer}>
            {isChartLoading || !chartData ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#aaa' }}>Veriler Yükleniyor...</p>
              </div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
          <div style={styles.timeRangeContainer}>
            {['1H', '1A', '3A', '6A', '1Y', '2Y', '3Y'].map(range => (
              <button key={range}
                style={{ ...styles.timeRangeButton, ...(chartTimeRange === range && styles.timeRangeButtonActive) }}
                onClick={() => setChartTimeRange(range)}>
                {range}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', marginTop: 20 }}>
            <button
              style={{ ...styles.modalButton, ...styles.buyButton }}
              onClick={() => openTradeModal(selectedStockForDetail, 'buy')}>
              AL
            </button>
            <button
              style={{ ...styles.modalButton, ...styles.sellButton }}
              onClick={() => openTradeModal(selectedStockForDetail, 'sell')}>
              SAT
            </button>
          </div>
        </div>
      </div>
    )}
  </div>);
}
