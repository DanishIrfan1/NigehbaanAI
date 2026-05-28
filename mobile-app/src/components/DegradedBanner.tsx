import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Banner } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type DegradedBannerProps = {
  degradedMode: boolean;
  warnings: string[];
  /** LLM responses were deterministic mocks (quota, empty key, or LLM_MODE=mock). */
  simulatedLlmPipeline?: boolean;
  visible?: boolean;
};

export default function DegradedBanner({
  degradedMode,
  warnings,
  simulatedLlmPipeline = false,
  visible = true,
}: DegradedBannerProps) {
  const showDegraded = degradedMode || warnings.length > 0;

  if (!visible || (!showDegraded && !simulatedLlmPipeline)) {
    return null;
  }

  const message =
    warnings.length > 0
      ? warnings.join(' · ')
      : degradedMode
        ? 'System running in degraded mode — some signal sources unavailable.'
        : '';

  return (
    <>
      {showDegraded ? (
        <Banner visible icon={({ size }) => <MaterialCommunityIcons name="alert" size={size} color="#ff9800" />}>
          <View style={styles.content}>
            <Text variant="labelMedium" style={styles.title}>
              {degradedMode ? 'DEGRADED MODE' : 'WARNING'}
            </Text>
            <Text variant="bodySmall" style={styles.message}>
              {message}
            </Text>
          </View>
        </Banner>
      ) : null}
      {simulatedLlmPipeline ? (
        <Banner
          visible
          icon={({ size }) => <MaterialCommunityIcons name="robot-outline" size={size} color="#64b5f6" />}
        >
          <View style={styles.content}>
            <Text variant="labelMedium" style={styles.demoTitle}>
              DEMO LLM DATA
            </Text>
            <Text variant="bodySmall" style={styles.message}>
              Pipeline used deterministic JSON for one or more agents (LLM_MODE=mock or Gemini quota / key
              fallback). Traces include llm_call_mock_mode or llm_call_fallback_mock. All tabs still reflect a
              coherent scenario for judging.
            </Text>
          </View>
        </Banner>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  title: { color: '#ff9800', fontWeight: 'bold', marginBottom: 4 },
  demoTitle: { color: '#64b5f6', fontWeight: 'bold', marginBottom: 4 },
  message: { color: '#ddd' },
});
