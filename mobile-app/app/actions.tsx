import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import ActionCard from '../components/ActionCard';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ActionsScreen() {
  const router = useRouter();
  const [completedCount, setCompletedCount] = useState(0);

  const handleActionDone = () => {
    setCompletedCount(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Response Execution</Text>
        <Text style={styles.subtitle}>Automated actions running in background</Text>

        <View style={styles.cardsContainer}>
          <ActionCard
            title="Traffic Rerouting"
            description="Alt route via F-10 now active"
            icon="map-marker-path"
            delayMs={1000}
            onDone={handleActionDone}
          />
          <ActionCard
            title="Emergency Dispatch"
            description="2 rescue units dispatched to G-10"
            icon="ambulance"
            delayMs={2500}
            onDone={handleActionDone}
          />
          <ActionCard
            title="Public Alert"
            description="4,200 users notified via app + SMS"
            icon="bullhorn"
            delayMs={4000}
            onDone={handleActionDone}
          />
          <ActionCard
            title="Hospital Alert"
            description="Emergency beds prepared at PIMS"
            icon="hospital-building"
            delayMs={5500}
            onDone={handleActionDone}
          />
        </View>

        {completedCount >= 4 && (
          <Animated.View entering={FadeInUp.duration(600)} style={styles.footer}>
            <TouchableOpacity 
              style={styles.outcomeButton} 
              onPress={() => router.push('/outcome')}
            >
              <Text style={styles.outcomeButtonText}>View Outcome Report</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212' 
  },
  content: { 
    padding: 16, 
    paddingBottom: 40 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#ffffff',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 24,
    marginTop: 4,
  },
  cardsContainer: {
    gap: 4,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  outcomeButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  outcomeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});
