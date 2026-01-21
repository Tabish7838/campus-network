import { useState, useEffect } from 'react';
import Card from '../Card/Card.jsx';
import CommentSection from '../CommentSection/CommentSection.jsx';
import { getLikeInfo, toggleLike } from '../../services/like.api.js';
import {
  formatName,
  formatRole,
  formatSkills,
  formatRelativeTime,
  getInitials,
} from '../../utils/formatters.js';

const stageStyles = {
  Ideation: 'bg-[#E8F4FF] text-[#0B61A4]',
  MVP: 'bg-[#E8FFEA] text-[#1B7F3A]',
  Scaling: 'bg-[#FFF0E6] text-[#C25A00]',
  default: 'bg-primary-light text-primary',
};

const ActionButton = ({ icon: Icon, label, onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
      disabled 
        ? 'text-muted/50 cursor-not-allowed' 
        : 'text-muted hover:bg-primary-light/60 hover:text-primary'
    }`}
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
    <span>{label}</span>
  </button>
);

const CommentIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-3.6-.64L3 20l1.64-4.91A7.64 7.64 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
  </svg>
);

const ShareIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    <path d="M16 6l-4-4-4 4" />
    <path d="M12 2v14" />
  </svg>
);

const HeartIcon = ({ filled, ...props }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  if (!post) {
    return null;
  }

  const {
    id: postId,
    post_id,
    authorProfile,
    title,
    description,
    stage,
    required_skills: requiredSkills,
    image_url: imageUrl,
    created_at: createdAt,
  } = post;

  const actualPostId = postId || post_id;
  const displayName = formatName(authorProfile?.name);
  const role = formatRole(authorProfile?.role);
  const college = authorProfile?.college;
  const headline = [role, college].filter(Boolean).join(' • ');
  const publishedTime = formatRelativeTime(createdAt);
  const skills = formatSkills(requiredSkills);
  const initials = getInitials(displayName);
  const stageBadgeClass = stageStyles[stage] || stageStyles.default;

  const hasImage = typeof imageUrl === 'string' && imageUrl.trim().length > 0;

  // Load like info when component mounts
  useEffect(() => {
    if (actualPostId) {
      loadLikeInfo();
    }
  }, [actualPostId]);

  const loadLikeInfo = async () => {
    try {
      const likeInfo = await getLikeInfo(actualPostId);
      setLikeCount(likeInfo.count);
      setIsLiked(likeInfo.isLiked);
    } catch (error) {
      console.error('Error loading like info:', error);
    }
  };

  const handleCommentClick = () => {
    setShowComments(true);
  };

  const handleLikeClick = async () => {
    if (likeLoading) return;

    try {
      setLikeLoading(true);
      const result = await toggleLike(actualPostId);
      setIsLiked(result.isLiked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: title,
      text: `Check out this startup idea: ${title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        const shareText = `${title}\n\n${description}\n\n${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        alert('Post details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback: copy URL only
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-base font-semibold text-primary">
            {initials || 'CS'}
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-body">{displayName}</p>
              {publishedTime && <span className="text-xs text-muted">• {publishedTime}</span>}
            </div>
            <p className="text-xs text-muted">
              {headline || 'Campus Startup Network member'}
            </p>
          </div>
        </div>
        {stage && (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${stageBadgeClass}`}>
            {stage}
          </span>
        )}
      </div>

      <div className="space-y-3 text-sm text-body">
        <h3 className="text-base font-semibold text-body">{title}</h3>
        {description && <p className="leading-relaxed text-muted whitespace-pre-line">{description}</p>}
        {hasImage && (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <img src={imageUrl} alt={title} loading="lazy" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {!!skills.length && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        {authorProfile?.branch && <span>Branch: {authorProfile.branch}</span>}
        {authorProfile?.year && <span>Year {authorProfile.year}</span>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          {authorProfile?.course && <span>{authorProfile.course}</span>}
          {authorProfile?.college && <span>{authorProfile.college}</span>}
        </div>
        <div className="flex items-center gap-2">
          <ActionButton 
            icon={({ className, ...props }) => (
              <HeartIcon 
                filled={isLiked} 
                className={`${className} ${isLiked ? 'text-red-500' : ''}`} 
                {...props} 
              />
            )}
            label={`${likeCount} Like${likeCount !== 1 ? 's' : ''}`}
            onClick={handleLikeClick}
            disabled={likeLoading}
          />
          <ActionButton 
            icon={CommentIcon} 
            label={`Comment${post.comment_count ? ` (${post.comment_count.length || 0})` : ''}`} 
            onClick={handleCommentClick} 
          />
          <ActionButton icon={ShareIcon} label="Share" onClick={handleShareClick} />
        </div>
      </div>

      {/* Comment Section Modal */}
      <CommentSection
        postId={actualPostId}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </Card>
  );
};

export default PostCard;
