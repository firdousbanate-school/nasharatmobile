-- 0066: Increase school-documents bucket file size limit from 20 MB to 25 MB (26,214,400 bytes).

update storage.buckets
set file_size_limit = 26214400
where id = 'school-documents';
