import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; from: 'user' | 'bot' }>>([]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input.trim(), from: 'user' as const };
    setMessages((m) => [userMsg, ...m]);
    setInput('');
    // placeholder bot reply
    setTimeout(() => {
      const botMsg = { id: (Date.now() + 1).toString(), text: `Got it — here's a quick tip about "${userMsg.text}".`, from: 'bot' as const };
      setMessages((m) => [botMsg, ...m]);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={[styles.msgCard, item.from === 'user' ? styles.user : styles.bot]}>
            <Card.Content>
              <Text>{item.text}</Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24 }}>Ask anything about fasteners</Text>}
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.composer}>
        <TextInput placeholder="Ask about this fastener..." value={input} onChangeText={setInput} style={styles.input} />
        <Button mode="contained" onPress={send} style={{ marginLeft: 8 }}>
          Send
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  msgCard: { marginBottom: 8 },
  user: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  bot: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  composer: { flexDirection: 'row', padding: 12, alignItems: 'center', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1 },
});
