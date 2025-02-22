import React from 'react';

interface CardProps {
  card: {
    name: string;
    isFlipped: boolean;
    position: 'upright' | 'reversed';
  };
  onClick: () => void;
}

const TarotCard: React.FC<CardProps> = ({ card, onClick }) => {
  const cardStyle = {
    transform: card.position === 'reversed' ? 'rotate(180deg)' : 'none',
  };

  return (
    <div
      className="relative w-32 h-48 cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
      style={cardStyle}
    >
      {card.isFlipped ? (
        <img
          src={`/tarot/${card.name}.jpg`}
          alt={card.name}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-full bg-blue-900 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">塔罗牌</span>
        </div>
      )}
    </div>
  );
};

export default TarotCard; 