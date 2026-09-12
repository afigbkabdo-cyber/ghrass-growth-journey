alter table public.values_week
  add column if not exists name_en text,
  add column if not exists tagline_en text,
  add column if not exists hadith_en text,
  add column if not exists source_en text,
  add column if not exists description_en text,
  add column if not exists learnings_en text[] not null default '{}',
  add column if not exists at_school_en text[] not null default '{}',
  add column if not exists at_home_en text[] not null default '{}';

alter table public.schedule_items
  add column if not exists title_en text,
  add column if not exists description_en text;

alter table public.activities
  add column if not exists title_en text,
  add column if not exists description_en text;

alter table public.children
  add column if not exists allergies_en text;

update public.values_week set
  name_en = 'Mercy', tagline_en = 'We learn to be merciful to those around us',
  hadith_en = 'The merciful ones will be shown mercy by the Most Merciful',
  source_en = 'Sunan Abu Dawud',
  description_en = 'The value of mercy: we nurture in the child kindness towards young, old and animals.'
where name = 'الرحمة';

update public.values_week set
  name_en = 'Altruism', tagline_en = 'We wish for others what we wish for ourselves',
  hadith_en = 'None of you truly believes until he loves for his brother what he loves for himself',
  source_en = 'Al-Bukhari',
  description_en = 'We train every child to put others first.'
where name = 'الإيثار';

update public.schedule_items set title_en = case title
    when 'استقبال الأطفال' then 'Children arrival'
    when 'الحلقة الصباحية' then 'Morning circle'
    when 'النشاط التعليمي' then 'Learning activity'
    when 'الوجبة' then 'Meal'
    when 'اللعب' then 'Play'
    when 'النشاط الخارجي' then 'Outdoor activity'
    else title_en end,
  description_en = case description
    when 'ترحيب وتهيئة' then 'Welcome and settling in'
    when 'قيمة الأسبوع والحديث' then 'Value of the week and hadith'
    when 'نشاط الصف' then 'Classroom activity'
    when 'وجبة الإفطار' then 'Breakfast'
    when 'لعب حر' then 'Free play'
    when 'ساحة الروضة' then 'Nursery yard'
    else description_en end;

update public.activities set title_en = 'How do we grow the value?', description_en = 'Experiment'
where title = 'كيف ننمي القيمة؟';

update public.classes set name_en = case name
    when 'فصل البذور' then 'Seeds Class'
    when 'فصل البراعم' then 'Buds Class'
    when 'فصل الأوراق' then 'Leaves Class'
    else name_en end;

update public.children set allergies_en = 'Milk and dairy products' where allergies = 'الحليب و منتجات اللبان';

update public.children set name_en = case name
    when 'ليان الحربي' then 'Layan Al-Harbi'
    when 'آدم الحربي' then 'Adam Al-Harbi'
    when 'محمد عمر الشهري' then 'Mohammed Omar Al-Shehri'
    when 'تالا الغامدي' then 'Tala Al-Ghamdi'
    when 'ريان الدوسري' then 'Rayan Al-Dosari'
    when 'مها السبيعي' then 'Maha Al-Subaie'
    when 'سلمى القحطاني' then 'Salma Al-Qahtani'
    when 'يوسف الزهراني' then 'Yousef Al-Zahrani'
    when 'جوري المطيري' then 'Jouri Al-Mutairi'
    else name_en end;

update public.profiles set full_name_en = case full_name
    when 'أم ليان الحربي' then 'Layan Al-Harbi''s mother'
    when 'أبو عمر الشهري' then 'Omar Al-Shehri''s father'
    when 'أ. نورة العتيبي' then 'Ms. Noura Al-Otaibi'
    when 'أ. سارة القحطاني' then 'Ms. Sarah Al-Qahtani'
    when 'أ. الجوهرة السبيعي' then 'Ms. Al-Jawhara Al-Subaie'
    when 'مسؤول نظام غراس' then 'Ghiras System Administrator'
    else full_name_en end;