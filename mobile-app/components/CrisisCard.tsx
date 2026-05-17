import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CrisisCardProps {
  title: string;
  location: string;
  situationType: string;
  confidence: number; // 0 to 100
  severity: Severity;
  impacts: string[];
}

const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  let backgroundColor = '#ffeb3b'; // LOW: yellow
  let textColor = '#000000';
  
  if (severity === 'HIGH') {
    backgroundColor = '#f44336'; // RED
    textColor = '#ffffff';
  } else if (severity === 'MEDIUM') {
    backgroundColor = '#ff9800'; // ORANGE
    textColor = '#ffffff';
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{severity}</Text>
    </View>
  );
};

const CrisisCard: React.FC<CrisisCardProps> = ({
  title,
  location,
  situationType,
  confidence,
  severity,
  impacts,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(confidence, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [confidence]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.duration(600).springify()}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <SeverityBadge severity={severity} />
        </View>
        <Text style={styles.location}>{location}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{situationType}</Text>
      </View>

      <View style={styles.confidenceSection}>
        <View style={styles.confidenceHeader}>
          <Text style={styles.label}>AI Confidence</Text>
          <Text style={styles.confidenceText}>{confidence}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, progressStyle]} />
        </View>
      </View>

      <View style={styles.impactsSection}>
        <Text style={styles.label}>Impact:</Text>
        {impacts.map((impact) => (
          <View key={impact} style={styles.impactRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.impactText}>{impact}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginRight: 8,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  confidenceSection: {
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2196f3',
    borderRadius: 4,
  },
  impactsSection: {
    marginTop: 4,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    paddingLeft: 4,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#666',
    marginRight: 6,
    lineHeight: 20,
  },
  impactText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
    lineHeight: 20,
  },
});

export default CrisisCard;
