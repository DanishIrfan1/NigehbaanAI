import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

export type ActionState = 'PENDING' | 'EXECUTING' | 'DONE';

type ActionCardProps = Readonly<{
  title: string;
  description: string;
  icon: string;
  delayMs: number;
  onDone?: () => void;
}>;

export default function ActionCard({ title, description, icon, delayMs, onDone }: ActionCardProps) {
  const [status, setStatus] = useState<ActionState>('PENDING');

  useEffect(() => {
    const execTimer = setTimeout(() => {
      setStatus('EXECUTING');
    }, delayMs);

    // Give it 1.5s to execute after it starts
    const doneTimer = setTimeout(() => {
      setStatus('DONE');
      if (onDone) onDone();
    }, delayMs + 1500);

    return () => {
      clearTimeout(execTimer);
      clearTimeout(doneTimer);
    };
  }, [delayMs]);

  const getStatusColor = () => {
    if (status === 'PENDING') return '#888888'; // gray
    if (status === 'EXECUTING') return '#ff9800'; // orange
    return '#4caf50'; // green
  };

  const getStatusIcon = () => {
    if (status === 'PENDING') return 'clock-outline';
    if (status === 'EXECUTING') return 'progress-clock';
    return 'check-circle';
  };

  return (
    <Animated.View entering={FadeInRight.delay(Math.min(delayMs, 800)).duration(400)}>
      <Card style={[styles.card, { borderColor: getStatusColor(), backgroundColor: '#1e1e1e' }]} mode="outlined">
        <Card.Content>
          <View style={styles.headerRow}>
            <MaterialCommunityIcons name={icon as any} size={28} color="#f44336" />
            <View style={styles.textColumn}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{description}</Text>
            </View>
            <View style={styles.statusBadge}>
              {status === 'EXECUTING' ? (
                <ActivityIndicator animating color="#ff9800" size={16} style={{ marginRight: 6 }} />
              ) : (
                <MaterialCommunityIcons name={getStatusIcon()} size={16} color={getStatusColor()} style={{ marginRight: 6 }} />
              )}
              <Text style={[styles.statusText, { color: getStatusColor() }]}>{status}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    color: '#aaaaaa',
    marginTop: 2,
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});
