import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../lib/auth';
import {
  createLink,
  deleteLink,
  listLinks,
  updateOccupancy,
} from '../../lib/data';
import {
  createEstablishment,
  getMyEstablishment,
  updateEstablishment,
} from '../../lib/ownerData';
import { colors, font, radius, spacing } from '../../lib/theme';
import type {
  Establishment,
  EstablishmentCategory,
  EstablishmentLink,
} from '../../lib/types';

const CATEGORIES: { key: EstablishmentCategory; label: string }[] = [
  { key: 'discoteca', label: 'Discoteca' },
  { key: 'bar', label: 'Bar' },
  { key: 'cocteleria', label: 'Coctelería' },
  { key: 'lounge', label: 'Lounge' },
  { key: 'pub', label: 'Pub' },
  { key: 'otro', label: 'Otro' },
];

export default function ManageScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const e = await getMyEstablishment(user.id);
    setEstablishment(e);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!user) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Inicia sesión para gestionar tu establecimiento.</Text>
      </Screen>
    );
  }

  if (user.role !== 'establishment_owner') {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>
          Esta sección es solo para dueños de establecimiento.
        </Text>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (!establishment) {
    return (
      <CreateEstablishmentForm
        ownerId={user.id}
        onCreated={(e) => setEstablishment(e)}
      />
    );
  }

  return (
    <EditEstablishmentView
      establishment={establishment}
      onChange={setEstablishment}
      onDeleted={() => router.back()}
    />
  );
}

// =====================================================================
// Crear (HU-08)
// =====================================================================

function CreateEstablishmentForm({
  ownerId,
  onCreated,
}: {
  ownerId: string;
  onCreated: (e: Establishment) => void;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<EstablishmentCategory>('bar');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [cover, setCover] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || !address.trim() || !capacity) {
      Alert.alert('Faltan campos', 'Nombre, dirección y aforo máximo son obligatorios.');
      return;
    }
    const cap = Number(capacity);
    if (Number.isNaN(cap) || cap <= 0) {
      Alert.alert('Aforo inválido', 'Debe ser un número mayor que cero.');
      return;
    }
    try {
      setSaving(true);
      const e = await createEstablishment(ownerId, {
        name: name.trim(),
        address: address.trim(),
        category,
        theme: theme.trim() || undefined,
        description: description.trim() || undefined,
        max_capacity: cap,
        cover_price: Number(cover) || 0,
        photo_url: photoUrl.trim() || undefined,
      });
      onCreated(e);
    } catch (err: any) {
      Alert.alert('Error al crear', err?.message ?? 'Intenta de nuevo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={styles.h1}>Registrar establecimiento</Text>
        <Text style={styles.sub}>
          Completa la info principal. Podrás editarla luego.
        </Text>

        <Input label="Nombre del lugar" value={name} onChangeText={setName} placeholder="Ej: Zaperoco" />
        <Input label="Dirección" value={address} onChangeText={setAddress} placeholder="Avenida 5N # 16-46" />

        <Text style={styles.fieldLabel}>Categoría</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              active={category === c.key}
              onPress={() => setCategory(c.key)}
            />
          ))}
        </View>

        <Input label="Temática (opcional)" value={theme} onChangeText={setTheme} placeholder="Ej: Salsa en vivo" />
        <Input
          label="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        <Input
          label="Aforo máximo"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
          placeholder="Ej: 200"
        />
        <Input
          label="Cover (COP)"
          value={cover}
          onChangeText={setCover}
          keyboardType="numeric"
          placeholder="0"
        />
        <Input
          label="URL de foto (opcional)"
          value={photoUrl}
          onChangeText={setPhotoUrl}
          autoCapitalize="none"
          placeholder="https://..."
        />

        <Button title="Crear establecimiento" onPress={submit} loading={saving} />
      </ScrollView>
    </Screen>
  );
}

// =====================================================================
// Editar (HU-2.5 links, RF11 aforo, RF6 eliminar enlace)
// =====================================================================

function EditEstablishmentView({
  establishment,
  onChange,
}: {
  establishment: Establishment;
  onChange: (e: Establishment) => void;
  onDeleted: () => void;
}) {
  const [occupancy, setOccupancy] = useState(String(establishment.current_occupancy));
  const [savingOccupancy, setSavingOccupancy] = useState(false);

  const [links, setLinks] = useState<EstablishmentLink[]>([]);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [addingLink, setAddingLink] = useState(false);

  const [edit, setEdit] = useState({
    name: establishment.name,
    address: establishment.address,
    description: establishment.description ?? '',
    max_capacity: String(establishment.max_capacity),
    cover_price: String(establishment.cover_price),
    photo_url: establishment.photo_url ?? '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    listLinks(establishment.id).then(setLinks).catch(() => {});
  }, [establishment.id]);

  const saveOccupancy = async () => {
    const n = Number(occupancy);
    if (Number.isNaN(n) || n < 0 || n > establishment.max_capacity) {
      Alert.alert('Aforo inválido', `Debe estar entre 0 y ${establishment.max_capacity}`);
      return;
    }
    try {
      setSavingOccupancy(true);
      await updateOccupancy(establishment.id, n);
      onChange({ ...establishment, current_occupancy: n });
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo actualizar');
    } finally {
      setSavingOccupancy(false);
    }
  };

  const addLink = async () => {
    if (!linkLabel.trim() || !linkUrl.trim()) {
      Alert.alert('Falta info', 'Etiqueta y URL son obligatorias');
      return;
    }
    try {
      new URL(linkUrl.trim());
    } catch {
      Alert.alert('URL inválida', 'Asegúrate de incluir http:// o https://');
      return;
    }
    if (links.some((l) => l.url === linkUrl.trim())) {
      Alert.alert('Duplicado', 'Ya agregaste este enlace');
      return;
    }
    try {
      setAddingLink(true);
      const l = await createLink(establishment.id, linkLabel.trim(), linkUrl.trim());
      setLinks((prev) => [...prev, l]);
      setLinkLabel('');
      setLinkUrl('');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo agregar');
    } finally {
      setAddingLink(false);
    }
  };

  const removeLinkLocal = async (id: string) => {
    Alert.alert('Eliminar enlace', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLink(establishment.id, id);
            setLinks((prev) => prev.filter((l) => l.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const saveEdit = async () => {
    const cap = Number(edit.max_capacity);
    if (Number.isNaN(cap) || cap <= 0) {
      Alert.alert('Aforo inválido', 'Debe ser mayor que cero');
      return;
    }
    try {
      setSavingEdit(true);
      const updated = await updateEstablishment(establishment.id, {
        name: edit.name.trim(),
        address: edit.address.trim(),
        description: edit.description.trim() || null,
        max_capacity: cap,
        cover_price: Number(edit.cover_price) || 0,
        photo_url: edit.photo_url.trim() || null,
      });
      onChange(updated);
      Alert.alert('Guardado', 'Perfil actualizado');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo guardar');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl * 2 }}>
        <Text style={styles.h1}>{establishment.name}</Text>
        <Text style={styles.sub}>{establishment.address}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aforo en tiempo real</Text>
          <Text style={styles.cardHint}>
            Capacidad máxima: {establishment.max_capacity}
          </Text>
          <View style={styles.occupancyRow}>
            <View style={{ flex: 1 }}>
              <Input
                value={occupancy}
                onChangeText={setOccupancy}
                keyboardType="numeric"
                placeholder="Personas dentro"
              />
            </View>
            <View style={{ marginLeft: spacing.sm, marginBottom: spacing.md }}>
              <Button
                title="Actualizar"
                onPress={saveOccupancy}
                loading={savingOccupancy}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enlaces del perfil</Text>
          <Text style={styles.cardHint}>
            Redes sociales, reservas, menú digital...
          </Text>
          {links.map((l) => (
            <View key={l.id} style={styles.linkRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkLabel}>{l.label}</Text>
                <Text style={styles.linkUrl} numberOfLines={1}>
                  {l.url}
                </Text>
              </View>
              <Pressable onPress={() => removeLinkLocal(l.id)} hitSlop={10}>
                <Text style={styles.linkDelete}>✕</Text>
              </Pressable>
            </View>
          ))}
          <Input
            label="Etiqueta"
            placeholder="Instagram"
            value={linkLabel}
            onChangeText={setLinkLabel}
          />
          <Input
            label="URL"
            placeholder="https://instagram.com/..."
            autoCapitalize="none"
            value={linkUrl}
            onChangeText={setLinkUrl}
          />
          <Button title="Agregar enlace" onPress={addLink} loading={addingLink} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Editar perfil</Text>
          <Input label="Nombre" value={edit.name} onChangeText={(v) => setEdit({ ...edit, name: v })} />
          <Input label="Dirección" value={edit.address} onChangeText={(v) => setEdit({ ...edit, address: v })} />
          <Input
            label="Descripción"
            value={edit.description}
            onChangeText={(v) => setEdit({ ...edit, description: v })}
            multiline
          />
          <Input
            label="Aforo máximo"
            keyboardType="numeric"
            value={edit.max_capacity}
            onChangeText={(v) => setEdit({ ...edit, max_capacity: v })}
          />
          <Input
            label="Cover (COP)"
            keyboardType="numeric"
            value={edit.cover_price}
            onChangeText={(v) => setEdit({ ...edit, cover_price: v })}
          />
          <Input
            label="URL de foto"
            autoCapitalize="none"
            value={edit.photo_url}
            onChangeText={(v) => setEdit({ ...edit, photo_url: v })}
          />
          <Button title="Guardar cambios" onPress={saveEdit} loading={savingEdit} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: font.xxl, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: font.md, marginBottom: spacing.lg },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: font.sm,
    marginBottom: 6,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardTitle: { color: colors.text, fontSize: font.lg, fontWeight: '700' },
  cardHint: { color: colors.textMuted, fontSize: font.sm, marginBottom: spacing.md },
  occupancyRow: { flexDirection: 'row', alignItems: 'flex-start' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkLabel: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  linkUrl: { color: colors.textMuted, fontSize: font.sm, marginTop: 2 },
  linkDelete: { color: colors.danger, fontSize: 18, paddingHorizontal: spacing.sm },
});
