CREATE TABLE t_p76073717_android_database_man.dse_records (
  id         SERIAL PRIMARY KEY,
  number     VARCHAR(50)  NOT NULL,
  designation VARCHAR(100),
  name       VARCHAR(255) NOT NULL,
  grade      SMALLINT CHECK (grade BETWEEN 1 AND 8),
  hours      NUMERIC(8,2),
  work_date  DATE,
  order_num  VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);