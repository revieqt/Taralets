import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, TouchableOpacity, FlatList, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from "expo-router";
import { db } from '../../auth/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

function formatDate(date: any) {
  if (!date) return '';
  // Firestore Timestamp or JS Date
  try {
    if (date.toDate) {
      date = date.toDate();
    }
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

export default function TabTwoScreen() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'archive'>('pending');
  const [pendingItineraries, setPendingItineraries] = useState<any[]>([]);
  const [archivedItineraries, setArchivedItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItineraries = async () => {
      setLoading(true);
      try {
        const qPending = query(collection(db, 'itineraries'), where('status', '==', 'Active'));
        const qArchive = query(collection(db, 'itineraries'), where('status', '==', 'Archive'));

        const [pendingSnap, archiveSnap] = await Promise.all([
          getDocs(qPending),
          getDocs(qArchive),
        ]);

        setPendingItineraries(
          pendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        );
        setArchivedItineraries(
          archiveSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        );
      } catch (e) {
        setPendingItineraries([]);
        setArchivedItineraries([]);
      }
      setLoading(false);
    };
    fetchItineraries();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemDates}>
          {formatDate(item.startOn)} - {formatDate(item.endOn)}
        </ThemedText>
      </View>
      <ThemedText style={styles.itemStatus}>{item.status}</ThemedText>
    </View>
  );

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
          <IconSymbol size={24} name="left" color={"#cccccc"} />
        </TouchableOpacity>
        <ThemedText type='subtitle'>Itineraries</ThemedText>
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
          pendingItineraries.length > 0 ? (
            <FlatList
              data={pendingItineraries}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          ) : (
            <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>No pending itineraries.</ThemedText>
          )
        ) : (
          archivedItineraries.length > 0 ? (
            <FlatList
              data={archivedItineraries}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          ) : (
            <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>No archived itineraries.</ThemedText>
          )
        )}
      </ThemedView>
      
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/itineraries/create")}>
        <IconSymbol size={30} name="plus" color={"white"} />
      </TouchableOpacity>
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
    backgroundColor: '#fff',
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