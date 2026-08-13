import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Settings,
  Share2,
  Tags,
  Users,
} from "lucide-react";
import "./HelpGuide.css";

type SectionId =
  | "start"
  | "webinars"
  | "experts"
  | "socials"
  | "rubrics"
  | "content"
  | "stream"
  | "mistakes";

const SECTIONS: { id: SectionId; title: string }[] = [
  { id: "start", title: "С чего начать" },
  { id: "webinars", title: "Вебинары" },
  { id: "experts", title: "Эксперты" },
  { id: "socials", title: "Соцсети" },
  { id: "rubrics", title: "Рубрики (тематики)" },
  { id: "content", title: "Контент сайта (тексты, логотип, цифры)" },
  { id: "stream", title: "Фото или онлайн-эфир на главной" },
  { id: "mistakes", title: "Частые ошибки" },
];

export const HelpGuidePage = () => {
  const [openId, setOpenId] = useState<SectionId | null>("start");

  const toggle = (id: SectionId) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="help-guide">
      <div className="page-header">
        <h1 className="page-title">Инструкция</h1>
      </div>

      <div className="card help-guide__intro">
        <div className="help-guide__intro-icon">
          <BookOpen size={28} />
        </div>
        <div>
          <p className="help-guide__lead">
            Это шпаргалка: куда нажать в левом меню и что заполнять, чтобы
            изменения появились на сайте.
          </p>
          <p className="help-guide__note">
            Правило №1: после правок почти всегда нужна кнопка{" "}
            <strong>«Сохранить»</strong> / «Создать» / «Обновить». Без неё на
            сайте ничего не изменится.
          </p>
          <p className="help-guide__note">
            Правило №2: обновите страницу сайта (F5), если правки не видны сразу.
          </p>
        </div>
      </div>

      <div className="help-guide__toc card">
        <h2 className="help-guide__toc-title">Быстрый переход</h2>
        <div className="help-guide__toc-list">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className="help-guide__toc-btn"
              onClick={() => {
                setOpenId(section.id);
                document
                  .getElementById(`help-${section.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      <GuideSection
        id="start"
        open={openId === "start"}
        onToggle={() => toggle("start")}
        title="С чего начать"
        icon={<BookOpen size={20} />}
      >
        <ol className="help-guide__steps">
          <li>
            Слева — меню разделов. Нажимаете нужный пункт (например, «Вебинары»).
          </li>
          <li>
            Внутри раздела обычно есть список. Чтобы создать новое — кнопка
            «Добавить…» справа сверху.
          </li>
          <li>
            Чтобы изменить существующее — клик по названию или иконка карандаша.
          </li>
          <li>
            Тексты шапки, логотип, цифры «600+» и эфир на главной — только в{" "}
            <Link to="/site-content">Контент сайта</Link>.
          </li>
        </ol>
        <div className="help-guide__map">
          <GuideLink to="/webinars" icon={<Calendar size={16} />} label="Вебинары" />
          <GuideLink to="/experts" icon={<Users size={16} />} label="Эксперты" />
          <GuideLink to="/socials" icon={<Share2 size={16} />} label="Соцсети" />
          <GuideLink to="/rubrics" icon={<Tags size={16} />} label="Рубрики" />
          <GuideLink
            to="/site-content"
            icon={<Settings size={16} />}
            label="Контент сайта"
          />
        </div>
      </GuideSection>

      <GuideSection
        id="webinars"
        open={openId === "webinars"}
        onToggle={() => toggle("webinars")}
        title="Вебинары"
        icon={<Calendar size={20} />}
        linkTo="/webinars"
      >
        <h3>Зачем раздел</h3>
        <p>
          Здесь живут анонсы и записи. От них зависят главная, календарь и
          страница «Все выпуски».
        </p>

        <h3>Как добавить вебинар</h3>
        <ol className="help-guide__steps">
          <li>
            Меню слева → <Link to="/webinars">Вебинары</Link>.
          </li>
          <li>Справа сверху → «Добавить вебинар».</li>
          <li>
            Заполните обязательное: название, описание, дату и время начала.
          </li>
          <li>
            Привяжите эксперта (если есть) и одну или несколько рубрик.
          </li>
          <li>
            Загрузите фото/превью. Без картинки на сайте будет заглушка.
          </li>
          <li>
            Чтобы вебинар появился на сайте — включите публикацию
            («опубликован»). Неопубликованный виден только в админке.
          </li>
          <li>Нажмите «Создать» / «Обновить».</li>
        </ol>

        <h3>Важные поля простыми словами</h3>
        <ul>
          <li>
            <strong>Дата и время начала</strong> — когда проходит эфир. По ним
            сайт понимает: это «ближайший» или уже «прошедший».
          </li>
          <li>
            <strong>Дата/время окончания</strong> — по возможности заполняйте.
            Нужны для длительности и архива.
          </li>
          <li>
            <strong>Ссылка на эфир</strong> — куда вести зрителя на сам эфир
            (кнопка у карточки). Это <em>не</em> то же самое, что большой плеер
            слева на главной (плеер настраивается в «Контент сайта»).
          </li>
          <li>
            <strong>Ссылки на записи</strong> — до 4 штук (VK, Rutube и т.д.) для
            прошедших.
          </li>
          <li>
            <strong>Рубрики</strong> — один вебинар можно повесить на несколько
            тематик. Сначала создайте рубрики в разделе «Рубрики».
          </li>
        </ul>

        <div className="help-guide__callout">
          <strong>Когда вебинар попадёт в «Ближайший» на главной?</strong>
          <p>
            Если он опубликован и дата начала ещё в будущем. Если будущих нет —
            сайт покажет прошедшие (зависит от режима в «Контент сайта»).
          </p>
        </div>
      </GuideSection>

      <GuideSection
        id="experts"
        open={openId === "experts"}
        onToggle={() => toggle("experts")}
        title="Эксперты"
        icon={<Users size={20} />}
        linkTo="/experts"
      >
        <h3>Зачем раздел</h3>
        <p>
          Карточки спикеров на главной и на странице «Наши эксперты». Кнопка
          «Стать экспертом» на сайте ведёт на внешнюю форму вопроса — её текст
          меняется в «Контент сайта».
        </p>

        <h3>Как добавить эксперта</h3>
        <ol className="help-guide__steps">
          <li>
            <Link to="/experts">Эксперты</Link> → «Добавить эксперта».
          </li>
          <li>ФИО обязательно. Фото желательно (круглая аватарка).</li>
          <li>
            «Краткая информация» — короткий текст под именем в блоке ближайшего
            вебинара.
          </li>
          <li>
            Можно привязать вебинары эксперта (поиск по названию в форме).
          </li>
          <li>Сохраните.</li>
        </ol>

        <div className="help-guide__callout">
          <strong>Порядок действий, если новый спикер + новый эфир</strong>
          <p>
            1) Создайте эксперта → 2) Создайте вебинар и выберите этого эксперта
            → 3) Опубликуйте вебинар.
          </p>
        </div>
      </GuideSection>

      <GuideSection
        id="socials"
        open={openId === "socials"}
        onToggle={() => toggle("socials")}
        title="Соцсети"
        icon={<Share2 size={20} />}
        linkTo="/socials"
      >
        <h3>Зачем раздел</h3>
        <p>
          Иконки внизу сайта («Где смотреть наши вебинары»). Каждая карточка =
          название + ссылка + иконка.
        </p>
        <ol className="help-guide__steps">
          <li>
            <Link to="/socials">Соцсети</Link> → «Добавить соцсеть».
          </li>
          <li>Название (VK, Rutube…), полная ссылка https://…</li>
          <li>Загрузите иконку (картинка).</li>
          <li>Сохраните.</li>
        </ol>
        <p>
          Без ссылки карточка на сайте не кликается (и не должна выглядеть как
          кнопка). Без иконки будет пустое место — лучше всегда грузить файл.
        </p>
      </GuideSection>

      <GuideSection
        id="rubrics"
        open={openId === "rubrics"}
        onToggle={() => toggle("rubrics")}
        title="Рубрики (тематики)"
        icon={<Tags size={20} />}
        linkTo="/rubrics"
      >
        <h3>Зачем раздел</h3>
        <p>
          Тематики для фильтра на странице «Все выпуски» и тегов у вебинаров.
        </p>
        <ol className="help-guide__steps">
          <li>
            Создайте рубрику в <Link to="/rubrics">Рубрики</Link> (только
            название).
          </li>
          <li>
            Откройте вебинар и отметьте нужные рубрики (можно несколько).
          </li>
          <li>Сохраните вебинар.</li>
        </ol>
        <p>
          Если удалить рубрику — связи с вебинарами тоже уберутся. Сами вебинары
          не удалятся.
        </p>
      </GuideSection>

      <GuideSection
        id="content"
        open={openId === "content"}
        onToggle={() => toggle("content")}
        title="Контент сайта"
        icon={<Settings size={20} />}
        linkTo="/site-content"
      >
        <h3>Зачем раздел</h3>
        <p>
          Все «тексты вокруг» сайта: логотип, названия в меню, заголовок
          «ОТКРЫТОЕ / …», кнопки на главной, цифры 600+, тексты «О нас», режимы
          блоков вебинаров.
        </p>
        <p>
          Откройте <Link to="/site-content">Контент сайта</Link>, поправьте
          нужный блок и нажмите одну большую кнопку{" "}
          <strong>«Сохранить»</strong> внизу.
        </p>

        <h3>Что в какой секции</h3>
        <ul>
          <li>
            <strong>Бренд</strong> — логотипы и три строки заголовка (одни и те
            же на главной и на «О нас»).
          </li>
          <li>
            <strong>Шапка</strong> — только подписи пунктов меню. Адреса страниц
            не меняются.
          </li>
          <li>
            <strong>Главная · герой</strong> — текст под заголовком и две кнопки.
          </li>
          <li>
            <strong>Главная · блок вебинара</strong> — заголовки блоков,
            режим «ближайший/прошедший», фото или эфир слева (см. следующий
            раздел инструкции).
          </li>
          <li>
            <strong>О нас</strong> — два текстовых блока справа в истории.
          </li>
          <li>
            <strong>Статистика</strong> — «600+», «100 000+», «20+» и подписи к
            ним (главная и «О нас»).
          </li>
        </ul>

        <h3>Режимы блока вебинара на главной</h3>
        <ul>
          <li>
            <strong>Авто</strong> — если есть будущий опубликованный вебинар,
            показывается он; прошедшие тоже (как обычно).
          </li>
          <li>
            <strong>Всегда ближайший</strong> — только блок ближайшего. Если
            ближайшего нет — сайт покажет прошедшие, чтобы не было пустоты.
          </li>
          <li>
            <strong>Всегда прошедший</strong> — только прошедшие (карточки или
            одно видео — смотрите поле «Отображение прошедшего»).
          </li>
        </ul>
      </GuideSection>

      <GuideSection
        id="stream"
        open={openId === "stream"}
        onToggle={() => toggle("stream")}
        title="Фото или онлайн-эфир на главной"
        icon={<Calendar size={20} />}
        linkTo="/site-content"
      >
        <p>
          Слева в карточке «Ближайший вебинар» может быть либо фото вебинара, либо
          встроенный плеер VK/OK.
        </p>

        <h3>Как включить эфир</h3>
        <ol className="help-guide__steps">
          <li>
            Заранее создайте и опубликуйте ближайший вебинар (чтобы справа была
            инфа: дата, тема, эксперт).
          </li>
          <li>
            <Link to="/site-content">Контент сайта</Link> → секция «Главная ·
            блок вебинара».
          </li>
          <li>
            Поле «Слева у ближайшего» → выберите{" "}
            <strong>«Онлайн-эфир (VK / OK)»</strong>.
          </li>
          <li>
            В поле «Ссылка на эфир» вставьте ссылку или код iframe.
          </li>
          <li>«Сохранить». Обновите главную сайта.</li>
        </ol>

        <h3>Какую ссылку вставлять</h3>
        <ul>
          <li>
            <strong>Лучший вариант:</strong> в VK или Одноклассниках откройте
            видео → Поделиться → Экспорт / Встроить → скопируйте код{" "}
            <code>&lt;iframe …&gt;</code> целиком или только адрес из{" "}
            <code>src=&quot;…&quot;</code>.
          </li>
          <li>
            Обычная ссылка вида <code>vk.com/video-123_456</code> тоже часто
            работает.
          </li>
          <li>
            Если ссылка «непонятная» сайту — слева останется фото и кнопка
            «Смотреть эфир» (откроет VK/OK в новой вкладке).
          </li>
        </ul>

        <div className="help-guide__callout">
          <strong>Вернуть фото</strong>
          <p>
            Снова выберите «Фото вебинара» и сохраните. Ссылку эфира можно
            оставить — она просто не будет использоваться, пока выбран режим
            фото.
          </p>
        </div>
      </GuideSection>

      <GuideSection
        id="mistakes"
        open={openId === "mistakes"}
        onToggle={() => toggle("mistakes")}
        title="Частые ошибки"
        icon={<BookOpen size={20} />}
      >
        <ul className="help-guide__checklist">
          <li>
            <strong>«На сайте пусто»</strong> — забыли нажать «Сохранить» /
            «Опубликовать» вебинар / обновить страницу сайта (F5).
          </li>
          <li>
            <strong>«Ближайшего нет»</strong> — нет опубликованного вебинара с
            датой в будущем, или дата уже прошла.
          </li>
          <li>
            <strong>«Эфир не крутится»</strong> — режим всё ещё «Фото», пустая
            ссылка, или нужна ссылка из «Экспорт» VK/OK.
          </li>
          <li>
            <strong>«Рубрики не фильтруют»</strong> — рубрика создана, но к
            вебинару не привязана.
          </li>
          <li>
            <strong>«Эксперт без фото / вебинара»</strong> — не загрузили фото
            или не привязали вебинары; кнопка «Вебинар» на сайте активна только
            если есть связанный выпуск.
          </li>
          <li>
            <strong>«Меню не то»</strong> — меняются только названия пунктов в
            «Контент сайта → Шапка». Сами страницы (/calendar и т.д.) не
            переименовываются адресом.
          </li>
        </ul>
      </GuideSection>
    </div>
  );
};

function GuideLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link to={to} className="help-guide__map-link">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function GuideSection({
  id,
  open,
  onToggle,
  title,
  icon,
  linkTo,
  children,
}: {
  id: SectionId;
  open: boolean;
  onToggle: () => void;
  title: string;
  icon: ReactNode;
  linkTo?: string;
  children: ReactNode;
}) {
  return (
    <section id={`help-${id}`} className="card help-guide__section">
      <button
        type="button"
        className="help-guide__section-head"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="help-guide__section-head-left">
          {icon}
          <span>{title}</span>
        </span>
        <span className="help-guide__section-head-right">
          {linkTo ? (
            <Link
              to={linkTo}
              className="help-guide__open-section"
              onClick={(e) => e.stopPropagation()}
            >
              Открыть раздел
            </Link>
          ) : null}
          <ChevronDown
            size={20}
            className={
              open
                ? "help-guide__chevron help-guide__chevron--open"
                : "help-guide__chevron"
            }
          />
        </span>
      </button>
      {open ? <div className="help-guide__section-body">{children}</div> : null}
    </section>
  );
}
