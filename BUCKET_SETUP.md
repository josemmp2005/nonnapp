# 📦 Configuración del Storage Bucket

Para que la subida de avatares funcione, necesitas crear un bucket en Supabase:

## 1️⃣ Crear el Bucket

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/qcwoaqebszgwigofsapc
2. Click en **Storage** en el menú lateral
3. Click en **"Create a new bucket"**
4. Nombre del bucket: `user-uploads`
5. Marca como **Public** (para que las imágenes sean accesibles)
6. Click en **"Create bucket"**

## 2️⃣ Configurar Políticas (RLS)

Después de crear el bucket, configura las políticas de acceso:

### Política de UPLOAD (Subir archivos)

```sql
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.filename(name)).split('-')[1]
);
```

### Política de READ (Lectura pública)

```sql
CREATE POLICY "Public avatars are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = 'avatars'
);
```

### Política de DELETE (Eliminar propios archivos)

```sql
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.filename(name)).split('-')[1]
);
```

## 3️⃣ Estructura del Bucket

```
user-uploads/
  └── avatars/
      ├── user-id-1-timestamp.jpg
      ├── user-id-2-timestamp.png
      └── ...
```

## ✅ Verificar que funciona

1. Ve a tu perfil en la app
2. Sube una imagen
3. Guarda cambios
4. Verifica en Supabase Storage que el archivo se subió correctamente
5. El avatar debería aparecer en el sidebar

## 🔧 Alternativa rápida (SQL Editor)

Si prefieres crear las políticas desde el SQL Editor:

```sql
-- Habilitar RLS en el bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Permitir subir avatares propios
CREATE POLICY "Allow authenticated uploads to avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads');

-- Permitir lectura pública
CREATE POLICY "Public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-uploads');

-- Permitir eliminar propios archivos
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'user-uploads' AND owner = auth.uid());
```
