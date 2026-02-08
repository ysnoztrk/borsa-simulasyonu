import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, updateDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './index.css';

// --- CHART JS REGISTER ---
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- FIREBASE YAPILANDIRMASI (Senin config bilgilerin) ---
const firebaseConfig = {
  apiKey: "AIzaSyCBE4bg19z6BUm-L4LdHDwu2jg7aFsGM8s",
  authDomain: "borsasimulasyonu-7e5a7.firebaseapp.com",
  projectId: "borsasimulasyonu-7e5a7",
  storageBucket: "borsasimulasyonu-7e5a7.appspot.com",
  messagingSenderId: "1036998632644",
  appId: "1:1036998632644:web:0f417849646f9018446960"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- ANA BİLEŞEN ---
function App() {
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, mode: 'auto' });
  const [stocks, setStocks] = useState([]);
  const [forex, setForex] = useState({ USD: 0, EUR: 0, ALTIN: 0 });
  const [news, setNews] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Basit admin kontrolü

  // 1. Piyasa Durumunu ve Dövizleri Dinle
  useEffect(() => {
    const unsubStatus = onSnapshot(doc(db, "system", "marketStatus"), (doc) => {
      if (doc.exists()) setMarketStatus(doc.data());
    });

    const unsubForex = onSnapshot(doc(db, "market", "forex"), (doc) => {
      if (doc.exists()) setForex(doc.data());
    });

    const qNews = query(collection(db, "news"), orderBy("createdAt", "desc"), limit(5));
    const unsubNews = onSnapshot(qNews, (snapshot) => {
      setNews(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubStatus(); unsubForex(); unsubNews(); };
  }, []);

  // 2. Hisseleri Dinle
  useEffect(() => {
    const qStocks = query(collection(db, "stocks"), orderBy("price", "desc"));
    const unsubStocks = onSnapshot(qStocks, (snapshot) => {
      setStocks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubStocks();
  }, []);

  // 3. Seçili Hisse Grafiğini Oluştur (Sahte Geçmiş Verisi Entekrasyonu)
  useEffect(() => {
    if (!selectedStock) return;

    // Gerçek uygulamada burası 'history' koleksiyonundan çekilir.
    // Şimdilik görsel doluluk için simülasyon yapıyoruz.
    const generateFakeHistory = () => {
        const labels = [];
        const data = [];
        let price = selectedStock.price;
        // Son 50 gün/saat simülasyonu
        for (let i = 50; i >= 0; i--) {
            labels.push(`${i}g önce`);
            // Rastgele dalgalanma ile geriye doğru veri üret
            price = price * (1 + (Math.random() - 0.5) * 0.1); 
            data.unshift(price);
        }
        // Son veriyi güncel fiyat yap
        data[data.length - 1] = selectedStock.price; 
        
        return {
            labels,
            datasets: [{
                label: `${selectedStock.symbol} Fiyat Grafiği`,
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }]
        };
    };

    setChartData(generateFakeHistory());

  }, [selectedStock]);

  // --- YÖNETİCİ FONKSİYONLARI ---
  const toggleMarketMode = async () => {
    // Mantık: Şu an Auto ise -> Manuele geç (Şu anki duruma göre tersini yap)
    // Şu an Manual ise -> Auto'ya dön
    
    const statusRef = doc(db, "system", "marketStatus");
    
    if (marketStatus.mode === 'auto') {
        // Otomatikten Manuele geçiyoruz. Eğer şu an Açıksa -> Kapat, Kapalıysa -> Aç
        const newStatus = !marketStatus.isOpen;
        await updateDoc(statusRef, {
            mode: 'manual',
            isOpen: newStatus
        });
    } else {
        // Zaten manuel, butona basınca Otomatiğe dönmeli
        await updateDoc(statusRef, { mode: 'auto' });
    }
  };

  // Buton Metnini Belirle
  const getButtonText = () => {
    const hour = new Date().getHours();
    const shouldBeOpen = hour >= 14 && hour < 21;

    if (marketStatus.mode === 'auto') {
        // Otomatik modda, manuel müdahale için buton ne demeli?
        // Eğer şu an 14-21 arasındaysa (Açık), buton "KAPAT (Manuel)" demeli.
        // Eğer şu an kapalıysa, buton "AÇ (Manuel)" demeli.
        return shouldBeOpen ? "MANUEL KAPAT" : "MANUEL AÇ";
    } else {
        // Manuel modda. Buton "OTOMATİĞE DÖN" demeli.
        // Ama kullanıcıya şu anki durumu da hatırlatmak lazım.
        // İsteğin: "Eğer manüel açılmışsa, otomatik ayara dön yazsın (ki dönünce kapansın)"
        return "OTOMATİK AYARA DÖN";
    }
  };

  return (
    <div className="app-container">
      {/* ÜST BAR */}
      <header className="header">
        <h1>Borsa Simülasyonu</h1>
        <div className="market-badge" style={{ backgroundColor: marketStatus.isOpen ? '#4caf50' : '#f44336' }}>
          {marketStatus.isOpen ? 'PİYASA AÇIK' : 'PİYASA KAPALI'}
        </div>
        <div className="forex-bar">
            <span>USD: {forex.USD.toFixed(2)} TL</span>
            <span>EUR: {forex.EUR.toFixed(2)} TL</span>
            <span>ALTIN: {forex.ALTIN.toFixed(0)} TL</span>
        </div>
      </header>

      <main className="main-content">
        {/* SOL: HİSSE LİSTESİ */}
        <div className="stock-list">
            <h2>Hisseler</h2>
            {stocks.map(stock => (
                <div key={stock.id} onClick={() => setSelectedStock(stock)} className={`stock-item ${selectedStock?.id === stock.id ? 'active' : ''}`}>
                    <span className="symbol">{stock.symbol}</span>
                    <span className="price">{stock.price.toFixed(2)} ₺</span>
                    <span className={`change ${stock.lastChange > 0 ? 'up' : 'down'}`}>
                        %{stock.lastChange?.toFixed(2)}
                    </span>
                </div>
            ))}
        </div>

        {/* ORTA: GRAFİK VE DETAY */}
        <div className="chart-section">
            {selectedStock && chartData ? (
                <>
                    <h2>{selectedStock.symbol} - {selectedStock.name}</h2>
                    <div className="chart-container">
                        <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
                    </div>
                    <div className="trade-buttons">
                        <button className="btn-buy" disabled={!marketStatus.isOpen}>AL</button>
                        <button className="btn-sell" disabled={!marketStatus.isOpen}>SAT</button>
                    </div>
                    {!marketStatus.isOpen && <p className="warning">Piyasa kapalı, işlem yapılamaz.</p>}
                </>
            ) : (
                <p className="placeholder">Detay görmek için bir hisse seçin.</p>
            )}
        </div>

        {/* SAĞ: HABERLER VE ADMIN */}
        <div className="sidebar">
            <div className="news-section">
                <h3>Son Dakika Haberleri</h3>
                {news.map(n => (
                    <div key={n.id} className={`news-card ${n.isFake ? 'fake-news-debug' : ''}`}>
                        <h4>{n.title}</h4>
                        <p>{n.content}</p>
                        <small>{new Date(n.createdAt?.seconds * 1000).toLocaleTimeString()}</small>
                        {isAdmin && <button onClick={() => alert("Haber silinecek...")}>Sil</button>}
                    </div>
                ))}
            </div>

            <div className="admin-panel">
                <h3 onClick={() => setIsAdmin(!isAdmin)} style={{cursor: 'pointer'}}>Yönetici Paneli {isAdmin ? '(Aktif)' : '(Gizli)'}</h3>
                {isAdmin && (
                    <div className="controls">
                        <p>Şu anki Mod: <strong>{marketStatus.mode === 'auto' ? 'OTOMATİK' : 'MANUEL'}</strong></p>
                        <button onClick={toggleMarketMode} className="mode-btn">
                            {getButtonText()}
                        </button>
                        <p style={{fontSize: '12px', marginTop: '10px', color: '#888'}}>
                           Otomatik Mod: 14:00 - 21:00 arası açık olur.<br/>
                           Manuel Mod: Siz ne derseniz o olur.
                        </p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;
