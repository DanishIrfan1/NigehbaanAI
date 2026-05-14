import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import CrisisCard, { Severity } from '../components/CrisisCard';

const CrisisScreen = () => {
  const router = useRouter();

  const mockCrisisData = {
    title: "Flash Flooding Warning",
    location: "Sector G-10, Islamabad",
    situationType: "Natural Disaster / Flood",
    confidence: 92,
    severity: "HIGH" as Severity,
    impacts: [
      "Traffic blocked on Main Double Road",
      "Multiple vehicles stranded",
      "Power outages reported in block 4",
    ]
  };

  const timestamp = new Date().toLocaleString();
  const sourceSignals = [
    "Twitter: 45 reports of flooding",
    "PMD: Heavy rainfall alert",
    "Traffic Cam G-10: Submerged vehicles"
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Crisis Overview</Text>
      
      <CrisisCard {...mockCrisisData} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={() => router.push('/map')}
        >
          <Text style={styles.primaryButtonText}>See Response Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => router.push('/logs')}
        >
          <Text style={styles.secondaryButtonText}>View Agent Reasoning</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerSection}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.timestampText}>Detected: {timestamp}</Text>
        
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Source Signals</Text>
        {sourceSignals.map((signal, index) => (
          <View key={index} style={styles.signalRow}>
            <Text style={styles.signalDot}>•</Text>
            <Text style={styles.signalText}>{signal}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#f44336', // RED color for urgency
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSection: {
    marginTop: 32,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 14,
    color: '#666',
  },
  signalRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  signalDot: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  signalText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
});

export default CrisisScreen;
