CREATE OR REPLACE FUNCTION get_task_status_counts()
RETURNS TABLE (
  new       bigint,
  ongoing   bigint,
  on_hold   bigint,
  completed bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    count(*) FILTER (WHERE status = 'new')       AS new,
    count(*) FILTER (WHERE status = 'ongoing')   AS ongoing,
    count(*) FILTER (WHERE status = 'on_hold')   AS on_hold,
    count(*) FILTER (WHERE status = 'completed') AS completed
  FROM tasks;
$$;

GRANT EXECUTE ON FUNCTION get_task_status_counts() TO anon, authenticated;
