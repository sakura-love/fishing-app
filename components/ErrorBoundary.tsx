import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>
            {String.fromCodePoint(0x1f6a8)}
          </Text>
          <Text style={styles.title}>出了点问题</Text>
          <Text style={styles.message}>应用遇到了意外错误</Text>
          {this.state.error && (
            <Text style={styles.errorDetail}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity style={styles.btn} onPress={this.handleReset}>
            <Text style={styles.btnText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f8fa',
    padding: 32,
  },
  icon: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginTop: 16 },
  message: { fontSize: 15, color: '#95a5a6', marginTop: 8, textAlign: 'center' },
  errorDetail: {
    fontSize: 12, color: '#e74c3c', marginTop: 12, textAlign: 'center', paddingHorizontal: 16,
  },
  btn: {
    marginTop: 24, backgroundColor: '#1a5276', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
