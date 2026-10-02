import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

// Import thư viện gọi API dùng chung từ thư mục packages/api
// (Yêu cầu phải chạy `pnpm install` ở thư mục gốc để linking hoạt động)
// import { getTodos } from '@my-monorepo/api';

const App = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Tạm thời giả lập gọi API, khi bạn đã setup xong Backend,
    // hãy uncomment hàm getTodos() ở trên và sử dụng đoạn code thật bên dưới.
    setTimeout(() => {
      setData([{ id: 1, title: 'Kết nối Monorepo thành công!' }]);
      setLoading(false);
    }, 1500);

    /* Code thật để gọi Backend:
    getTodos()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError("Lỗi kết nối Backend: " + err.message);
        setLoading(false);
      });
    */
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>📱 App Mobile Đã Chạy!</Text>
        
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          data && data.map((item: any) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardText}>✅ {item.title}</Text>
            </View>
          ))
        )}

        <Text style={styles.instruction}>
          App đang nằm trong: apps/mobile/App.tsx
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    width: '100%',
    marginBottom: 20,
  },
  cardText: {
    fontSize: 18,
    color: '#374151',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  instruction: {
    marginTop: 40,
    color: '#6B7280',
    fontSize: 14,
  }
});

export default App;
