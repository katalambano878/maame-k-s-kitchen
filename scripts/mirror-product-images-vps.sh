#!/bin/bash
set -euo pipefail
ROOT=/data/maameks/storage
PUBLIC=https://maamekskitchen.ca/storage/v1/object/public
PSQL="sudo docker exec -i fleet-postgres psql -U postgres -d store_maameks"
mkdir -p "$ROOT/products/dishes"

$PSQL -At -c "SELECT id || E'\\t' || url FROM product_images WHERE url LIKE '%supabase.co/storage/%';" \
| while IFS=$'\t' read -r id url; do
  [ -z "${url:-}" ] && continue
  rel="${url#*object/public/}"
  dest="$ROOT/$rel"
  sudo mkdir -p "$(dirname "$dest")"
  if [ ! -s "$dest" ]; then
    echo "GET $rel"
    if ! sudo curl -fsSL "$url" -o "$dest"; then
      echo "FAIL $url"
      continue
    fi
  fi
  new="$PUBLIC/$rel"
  echo "UPDATE product_images SET url = '${new}' WHERE id = '${id}';" | $PSQL >/dev/null
done

echo "COPY combo dishes"
$PSQL <<'SQL'
INSERT INTO product_images (product_id, url, position, media_type)
SELECT dest.id, src.url, src.position, COALESCE(src.media_type, 'image')
FROM products dest
JOIN LATERAL (
  SELECT i.url, i.position, i.media_type
  FROM products s
  JOIN product_images i ON i.product_id = s.id
  WHERE s.name = CASE dest.name
    WHEN 'Fried rice &chicken' THEN 'Fried rice'
    WHEN 'Fried rice with chicken and salad' THEN 'Fried rice'
    WHEN 'Jollof rice' THEN 'Ghana Jollof rice'
    WHEN 'Beans stew with rice and plantain' THEN 'Beans stew'
    WHEN 'Groundnut soup with rice balls' THEN 'Groundnut soup'
    WHEN 'Waakye with stew protein gari spaghetti Shito' THEN 'Waakye'
    WHEN 'Plain rice' THEN 'Fried rice'
    ELSE NULL
  END
  ORDER BY i.position
) src ON true
WHERE dest.name IN (
  'Fried rice &chicken',
  'Fried rice with chicken and salad',
  'Jollof rice',
  'Beans stew with rice and plantain',
  'Groundnut soup with rice balls',
  'Waakye with stew protein gari spaghetti Shito',
  'Plain rice'
)
AND NOT EXISTS (
  SELECT 1 FROM product_images x WHERE x.product_id = dest.id
);
SQL

echo DONE
$PSQL -c "SELECT count(*) FILTER (WHERE url LIKE '%maamekskitchen.ca%') AS local, count(*) FILTER (WHERE url LIKE '%supabase.co%') AS remote, count(*) AS total FROM product_images;"
$PSQL -c "SELECT p.name, count(i.id) AS images FROM products p LEFT JOIN product_images i ON i.product_id = p.id GROUP BY p.name HAVING count(i.id) = 0 ORDER BY 1;"
