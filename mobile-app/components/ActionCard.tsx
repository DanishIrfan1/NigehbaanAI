import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ActivityIndicator, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

export type ActionState = 'PENDING' | 'EXECUTING' | 'DONE';

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  delayMs: number;
  onDone?: () => void;
}

export default function ActionCard({ title, description, icon, delayMs, onDone }: ActionCardProps) {
  const theme = useTheme();
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
        <Card.Title
          title={title}
          subtitle={description}
          titleStyle={{ color: '#ffffff', fontWeight: 'bold' }}
          subtitleStyle={{ color: '#aaaaaa' }}
          left={(props) => <MaterialCommunityIcons name={icon as any} size={28} color="#f44336" />}
          right={(props) => (
            <View style={styles.statusBadge}>
              {status === 'EXECUTING' ? (
                <ActivityIndicator animating color="#ff9800" size={16} style={{ marginRight: 6 }} />
              ) : (
                <MaterialCommunityIcons name={getStatusIcon()} size={16} color={getStatusColor()} style={{ marginRight: 6 }} />
              )}
              <Text style={[styles.statusText, { color: getStatusColor() }]}>{status}</Text>
            </View>
          )}
        />
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
