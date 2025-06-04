import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, TouchableOpacity, FlatList, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AntDesign from '@expo/vector-icons/AntDesign';
import { db } from '../../auth/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import RouteView from '@/components/modals/RouteView';

function formatDate(date: any) {
  if (!date) return '';
  try {
    if (date.toDate) {
      date = date.toDate();
    }
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

export default function RoutesScreen() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'archive'>('pending');
  const [pendingRoutes, setPendingRoutes] = useState<any[]>([]);
  const [archivedRoutes, setArchivedRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state for overlay
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setPendingRoutes([]);
          setArchivedRoutes([]);
          setLoading(false);
          return;
        }
        const userId = user.uid;

        // Fetch all routes for the user
        const q = query(
          collection(db, 'routes'),
          where('userID', '==', userId)
        );
        const snap = await getDocs(q);

        // Separate routes by status
        const pending: any[] = [];
        const archive: any[] = [];
        snap.docs.forEach(doc => {
          const data = { id: doc.id, ...doc.data() };
          if (data.status === 'forLater' || data.status === 'active' || data.status === 'Active') {
            pending.push(data);
          } else {
            archive.push(data);
          }
        });

        // Sort pending so that active routes are first
        pending.sort((a, b) => {
          if ((a.status === 'active' || a.status === 'Active') && (b.status !== 'active' && b.status !== 'Active')) {
            return -1;
          }
          if ((b.status === 'active' || b.status === 'Active') && (a.status !== 'active' && a.status !== 'Active')) {
            return 1;
          }
          return 0;
        });

        setPendingRoutes(pending);
        setArchivedRoutes(archive);
      } catch (e) {
        setPendingRoutes([]);
        setArchivedRoutes([]);
      }
      setLoading(false);
    };
    fetchRoutes();
  }, []);

  // Show overlay modal and pass route id to RouteView component
  const handleRoutePress = (route: any) => {
    setSelectedRouteId(route.id);
    setModalVisible(true);
  };

  // Helper to get start and end location names
  const getStartEndNames = (locationArr: any[]) => {
    if (!Array.isArray(locationArr) || locationArr.length === 0) return { start: '', end: '' };
    const start = locationArr[0]?.locationName || '';
    const end = locationArr[locationArr.length - 1]?.locationName || '';
    return { start, end };
  };

  const renderItem = ({ item }: { item: any }) => {
    const { start, end } = getStartEndNames(item.location);
    return (
      <TouchableOpacity onPress={() => handleRoutePress(item)}>
        <View style={styles.item}>
          <View>
            <ThemedText style={styles.itemName}>
              {start && end ? `${start} → ${end}` : 'Route'}
            </ThemedText>
            <ThemedText style={styles.itemDates}>
              {item.createdOn && item.createdOn.toDate ? item.createdOn.toDate().toLocaleDateString() : ''}
            </ThemedText>
          </View>
          <ThemedText style={styles.itemStatus}>{item.status}</ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <AntDesign size={24} name="left" color={"#cccccc"} />
        </TouchableOpacity>
        <ThemedText type='subtitle'>Routes</ThemedText>
      </ThemedView>

      {/* Tab Switcher */}
      <ThemedView style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'pending' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('pending')}
        >
          <ThemedText style={selectedTab === 'pending' ? styles.tabTextActive : styles.tabText}>
            Pending
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'archive' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('archive')}
        >
          <ThemedText style={selectedTab === 'archive' ? styles.tabTextActive : styles.tabText}>
            Archive
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Content */}
      <ThemedView style={{ flex: 1, width: '100%' }}>
        {loading ? (
          <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>Loading...</ThemedText>
        ) : selectedTab === 'pending' ? (
          pendingRoutes.length > 0 ? (
            <FlatList
              data={pendingRoutes}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          ) : (
            <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>No pending routes.</ThemedText>
          )
        ) : (
          archivedRoutes.length > 0 ? (
            <FlatList
              data={archivedRoutes}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          ) : (
            <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>No archived routes.</ThemedText>
          )
        )}
      </ThemedView>
      
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/routes/create")}>
        <AntDesign size={30} name="plus" color={"white"} />
      </TouchableOpacity>

      {/* Overlay Modal for Route Description using RouteView component */}
      <RouteView
        id={selectedRouteId ?? ''}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    display: 'flex',
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 25,
    borderColor: '#cccccc',
    width: '48%',
    alignItems: 'center',
    borderWidth: 2,
  },
  tabButtonActive: {
    backgroundColor: '#205781',
    borderColor: '#205781',
  },
  tabText: {
    color: '#cccccc',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    borderRadius: 50,
    padding: 15,
    elevation: 5,
  },
  item: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  itemName: {
    fontSize: 16,
    color: '#205781',
    fontWeight: 'bold',
  },
  itemDates: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemStatus: {
    fontSize: 15,
    color: '#888',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});