
import { useEffect, useState } from 'react'

const COMMENTS_API = 'http://localhost:7001/api/comments'

function Comments({ lessonId, showManagementButtons = false }) {
    const [comments, setComments] = useState([])
    const [author, setAuthor] = useState('')
    const [text, setText] = useState('')
    const [replyTo, setReplyTo] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [showComments, setShowComments] = useState(false)
    const [collapsedThreads, setCollapsedThreads] = useState({})
    const [showNewComment, setShowNewComment] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    async function loadComments() {
        try {
            setError('')

            const response = await fetch(
                `${COMMENTS_API}/lesson/${lessonId}${showManagementButtons ? '?includeHidden=true' : ''}`
            )

            if (!response.ok) {
                throw new Error('לא ניתן לטעון את התגובות')
            }

            const data = await response.json()
            setComments(data)
        } catch (err) {
            setError(err.message || 'שגיאה בטעינת התגובות')
        } finally {
            setLoading(false)
        }
    }



    async function updateCommentVisibility(commentId, action) {
        try {
            setError('')

            const response = await fetch(
                `${COMMENTS_API}/${commentId}/${action}`,
                { method: 'PATCH' }
            )

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'עדכון התגובה נכשל')
            }

            await loadComments()
        } catch (err) {
            setError(err.message || 'שגיאה בעדכון התגובה')
        }
    }

    async function hideComment(commentId) {
        await updateCommentVisibility(commentId, 'hide')
    }

    async function showComment(commentId) {
        await updateCommentVisibility(commentId, 'show')
    }


    useEffect(() => {
        setLoading(true)
        setShowComments(false)
        setShowNewComment(false)
        setReplyTo(null)
        loadComments()
    }, [lessonId])

    async function submitComment(event, parentComment = null) {
        event.preventDefault()

        const commentText = parentComment ? replyText : text

        if (!author.trim() || !commentText.trim()) {
            setError('יש למלא שם ותוכן תגובה')
            return
        }

        try {
            setSaving(true)
            setError('')

            const response = await fetch(COMMENTS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify({
                    lessonId,
                    author: author.trim(),
                    text: commentText.trim(),
                    parentComment,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'שמירת התגובה נכשלה')
            }

            setText('')
            setReplyText('')
            setReplyTo(null)
            setShowNewComment(false)
            setShowComments(true)

            await loadComments()
        } catch (err) {
            setError(err.message || 'שגיאה בשמירת התגובה')
        } finally {
            setSaving(false)
        }
    }

    function getParentId(comment) {
        const parent = comment.parentComment

        if (!parent) return null

        return typeof parent === 'object' ? parent._id : parent
    }

    function renderComment(comment) {
        const replies = comments.filter(
            item => getParentId(item) === comment._id
        )
        const isCollapsed = collapsedThreads[comment._id] === true

        return (
            <article className="comment" key={comment._id}>
                <div className="comment-message">
                    <strong>{comment.author}</strong>
                    <p>{comment.text}</p>
                    <small>
                        {new Date(comment.createdAt).toLocaleString('he-IL')}
                    </small>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setReplyTo(replyTo === comment._id ? null : comment._id)
                        setReplyText('')
                        setError('')
                    }}
                >
                    {replyTo === comment._id ? 'ביטול תשובה' : 'השיבי לתגובה'}
                </button>

                
                {showManagementButtons && (
                    comment.isVisible === false ? (
                        <button
                            type="button"
                            onClick={() => showComment(comment._id)}
                        >
                            הצגת התגובה
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => hideComment(comment._id)}
                        >
                            🔒 הסתרת התגובה
                        </button>
                    )
                )}


                {replyTo === comment._id && (
                    <form
                        className="comment-form reply-form"
                        onSubmit={event => submitComment(event, comment._id)}
                    >
                        <label>
                            שם:
                            <input
                                value={author}
                                onChange={event => setAuthor(event.target.value)}
                                required
                            />
                        </label>

                        <label>
                            תוכן התשובה:
                            <textarea
                                value={replyText}
                                onChange={event => setReplyText(event.target.value)}
                                maxLength={2000}
                                required
                            />
                        </label>

                        <button type="submit" disabled={saving}>
                            {saving ? 'שומר...' : 'שליחת תשובה'}
                        </button>
                    </form>
                )}


                {replies.length > 0 && (
                    <div className="comment-thread">
                        <button
                            type="button"
                            className="thread-toggle-button"
                            onClick={() => {
                                setCollapsedThreads(previous => ({
                                    ...previous,
                                    [comment._id]: !previous[comment._id],
                                }))
                            }}
                        >
                            {isCollapsed
                                ? `הצגת ${replies.length} תשובות`
                                : `הסתרת תשובות (${replies.length})`}
                        </button>

                        {!isCollapsed && (
                            <div className="comment-replies">
                                {replies.map(reply => renderComment(reply))}
                            </div>
                        )}
                    </div>
                )}

            </article>
        )
    }

    const topLevelComments = comments.filter(
        comment => !getParentId(comment)
    )

    return (
        <section className="comments-section" dir="rtl">
            <h3>תגובות ושיתוף ידע</h3>

            <div className="comments-actions">
                <button
                    type="button"
                    onClick={() => {
                        setShowNewComment(!showNewComment)
                        setError('')
                    }}
                >
                    {showNewComment ? 'ביטול הוספת תגובה' : '＋ הוספת תגובה'}
                </button>

                <button
                    type="button"
                    onClick={() => setShowComments(!showComments)}
                >
                    {showComments
                        ? 'הסתרת תגובות'
                        : `הצגת תגובות (${comments.length})`}
                </button>
            </div>

            {error && (
                <p className="status-message error">{error}</p>
            )}

            {showNewComment && (
                <form
                    className="comment-form"
                    onSubmit={event => submitComment(event)}
                >
                    <h4>הוספת תגובה חדשה</h4>

                    <label>
                        שם:
                        <input
                            value={author}
                            onChange={event => setAuthor(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        תוכן התגובה:
                        <textarea
                            value={text}
                            onChange={event => setText(event.target.value)}
                            maxLength={2000}
                            required
                        />
                    </label>

                    <button type="submit" disabled={saving}>
                        {saving ? 'שומר...' : 'שליחת תגובה'}
                    </button>
                </form>
            )}

            {showComments && (
                <div className="comments-conversation">
                    {loading ? (
                        <p>טוען תגובות...</p>
                    ) : topLevelComments.length === 0 ? (
                        <p>עדיין אין תגובות לשיעור הזה.</p>
                    ) : (
                        topLevelComments.map(comment => renderComment(comment))
                    )}
                </div>
            )}
        </section>
    )
}

export default Comments
