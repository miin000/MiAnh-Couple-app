-- Tăng giới hạn ảnh đại diện lên 10 MB.

update storage.buckets
set file_size_limit = 10485760
where id = 'avatars';
