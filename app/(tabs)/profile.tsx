import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, TextInput, Modal } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useCatches } from '../../hooks/useCatches';
import { getUserProfile, updateUserProfile, UserProfile } from '../../services/user-profile';

export default function ProfileScreen() {
  const router = useRouter();
  const { stats, loadRecords } = useCatches();
  const [profile, setProfile] = useState<UserProfile>({ id: 'default', nickname: '钓鱼人', updatedAt: '' });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editNickname, setEditNickname] = useState('');

  const loadProfile = async () => {
    const p = await getUserProfile();
    setProfile(p);
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
      loadProfile();
    }, [loadRecords])
  );

  const handleAvatarPress = () => {
    Alert.alert('更换头像', '选择图片来源', [
      { text: '拍照', onPress: handleTakePhoto },
      { text: '从相册选择', onPress: handlePickPhoto },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相机权限才能拍照');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      await updateUserProfile({ avatarUri: result.assets[0].uri });
      loadProfile();
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相册权限才能选择照片');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      await updateUserProfile({ avatarUri: result.assets[0].uri });
      loadProfile();
    }
  };

  const handleEditNickname = () => {
    setEditNickname(profile.nickname);
    setEditModalVisible(true);
  };

  const handleSaveNickname = async () => {
    if (!editNickname.trim()) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }
    await updateUserProfile({ nickname: editNickname.trim() });
    setEditModalVisible(false);
    loadProfile();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarWrapper}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🎣</Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>📷</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleEditNickname}>
          <Text style={styles.name}>{profile.nickname}</Text>
          <Text style={styles.editHint}>点击编辑昵称</Text>
        </TouchableOpacity>
        <Text style={styles.title}>记录每一条大鱼</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalCatches}</Text>
          <Text style={styles.statLabel}>总钓获</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.uniqueSpecies}</Text>
          <Text style={styles.statLabel}>鱼种数</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.maxLength || '-'}</Text>
          <Text style={styles.statLabel}>最大鱼(cm)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>成就</Text>
        <View style={styles.achievements}>
          {stats.totalCatches === 0 ? (
            <View style={styles.achievementEmpty}>
              <Text style={styles.achievementText}>去钓你的第一条鱼吧！</Text>
            </View>
          ) : (
            <>
              {stats.totalCatches >= 1 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>🎉</Text>
                  <Text style={styles.achievementName}>初出茅庐</Text>
                  <Text style={styles.achievementDesc}>钓获第一条鱼</Text>
                </View>
              )}
              {stats.totalCatches >= 10 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>🎣</Text>
                  <Text style={styles.achievementName}>小有斩获</Text>
                  <Text style={styles.achievementDesc}>累计钓获 10 条</Text>
                </View>
              )}
              {stats.uniqueSpecies >= 5 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>🐟</Text>
                  <Text style={styles.achievementName}>鱼种猎人</Text>
                  <Text style={styles.achievementDesc}>识别 5 种不同鱼</Text>
                </View>
              )}
              {stats.maxLength >= 50 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>🏆</Text>
                  <Text style={styles.achievementName}>大物猎手</Text>
                  <Text style={styles.achievementDesc}>钓获 50cm+ 的鱼</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设置</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/api')}
        >
          <Text style={styles.menuText}>API 配置</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/units')}
        >
          <Text style={styles.menuText}>单位偏好</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/about')}
        >
          <Text style={styles.menuText}>关于</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>编辑昵称</Text>
            <TextInput
              style={styles.modalInput}
              value={editNickname}
              onChangeText={setEditNickname}
              placeholder="输入昵称"
              placeholderTextColor="#999"
              maxLength={20}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveNickname}>
                <Text style={styles.modalSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  header: {
    backgroundColor: '#1a5276',
    padding: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: { fontSize: 40 },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  avatarBadgeText: { fontSize: 14 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  editHint: { fontSize: 12, color: '#aed6f1', marginTop: 2 },
  title: { fontSize: 14, color: '#aed6f1', marginTop: 4 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1a5276' },
  statLabel: { fontSize: 13, color: '#95a5a6', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 12 },
  achievements: { gap: 10 },
  achievementEmpty: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  achievementText: { fontSize: 15, color: '#95a5a6' },
  achievementBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementIcon: { fontSize: 28, marginRight: 12 },
  achievementName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  achievementDesc: { fontSize: 13, color: '#95a5a6', marginLeft: 'auto' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: { fontSize: 16, color: '#2c3e50' },
  menuArrow: { fontSize: 20, color: '#bdc3c7' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f5f8fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 16, color: '#7f8c8d' },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#1a5276',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSaveText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
