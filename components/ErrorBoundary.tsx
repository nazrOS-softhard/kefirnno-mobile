import { Component, type ReactNode } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '@/constants/Colors'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({ errorInfo: errorInfo.componentStack })
    console.error('КефирНно crashed:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>⚠️ Ошибка приложения</Text>
          <Text style={styles.subtitle}>КефирНно столкнулся с проблемой и не смог продолжить.</Text>

          <View style={styles.errorBox}>
            <Text style={styles.errorLabel}>Сообщение:</Text>
            <Text style={styles.errorText}>{this.state.error?.message ?? 'Неизвестная ошибка'}</Text>
          </View>

          {this.state.error?.stack && (
            <View style={styles.errorBox}>
              <Text style={styles.errorLabel}>Stack trace:</Text>
              <Text style={styles.errorTextSmall}>{this.state.error.stack}</Text>
            </View>
          )}

          {this.state.errorInfo && (
            <View style={styles.errorBox}>
              <Text style={styles.errorLabel}>Component stack:</Text>
              <Text style={styles.errorTextSmall}>{this.state.errorInfo}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </ScrollView>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '700', color: '#F87171', marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.muted, marginBottom: 20, lineHeight: 18 },
  errorBox: {
    backgroundColor: Colors.card, borderRadius: 12, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  errorLabel: { fontSize: 11, fontWeight: '700', color: Colors.accent, marginBottom: 6, textTransform: 'uppercase' },
  errorText: { fontSize: 13, color: Colors.text, lineHeight: 19 },
  errorTextSmall: { fontSize: 10, color: Colors.muted, lineHeight: 15, fontFamily: 'monospace' },
  button: {
    backgroundColor: Colors.accent, borderRadius: 12, padding: 14,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 14 },
})
