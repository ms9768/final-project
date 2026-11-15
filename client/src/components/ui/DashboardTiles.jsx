import { ArrowIcon, DashboardIcons, Spark } from './Decor'
import './Dashboard.css'

/*
  אריחי לוח בקרה, מחולקים לקבוצות.

  groups: [{ title, tone, items: [{ id, title, description }] }]
  featured (לא חובה): פריט אחד שמוצג כאריח גדול ובולט מעל הכול
  onNavigate(id): נקרא בלחיצה על אריח
*/
function DashboardTiles({ groups, featured, onNavigate }) {
    return (
        <div className="db">
            {featured && (
                <button
                    type="button"
                    className="db-featured"
                    onClick={() => onNavigate(featured.id)}
                >
                    <span className="db-featured-icon">
                        {DashboardIcons[featured.id]?.()}
                    </span>
                    <span className="db-featured-text">
                        <strong>{featured.title}</strong>
                        <span>{featured.description}</span>
                    </span>
                    <span className="hp-btn hp-btn-purple db-featured-cta">
                        {featured.cta || 'מתחילים'}
                        <ArrowIcon />
                    </span>
                    <Spark className="db-featured-spark" />
                </button>
            )}

            <div className="db-groups">
            {groups.map((group) => (
                <section
                    className={`db-group db-tone-${group.tone}`}
                    key={group.title}
                    style={{ '--count': group.items.length }}
                >
                    <h2 className="db-group-title">{group.title}</h2>

                    <div className="db-grid">
                        {group.items.map((item) => {
                            const Icon = DashboardIcons[item.id]

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className="db-tile"
                                    onClick={() => onNavigate(item.id)}
                                >
                                    <span className="db-tile-icon">{Icon && <Icon />}</span>
                                    <span className="db-tile-title">{item.title}</span>
                                    <span className="db-tile-description">{item.description}</span>
                                    <span className="db-tile-go">
                                        כניסה
                                        <ArrowIcon />
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </section>
            ))}
            </div>
        </div>
    )
}

export default DashboardTiles
