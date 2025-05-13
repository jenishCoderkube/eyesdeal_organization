import React from 'react'

function DashBoardCard() {
  const cardStyle = {
    maxWidth: '100%',
    height: '100%',
    border: '1px solid #dee2e6',
    overflow: 'hidden',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
    textAlign: 'center',
    marginBottom: '1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    backgroundColor: '#fff'
  }

  const headerStyle = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    padding: '0.75rem',
    borderBottom: '1px solid #dee2e6',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  }

  const bodyStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '1rem',
    fontSize: '1.125rem'
  }

  const cardData = [
    { title: "Today's Sale", value: 0 },
    { title: "This Week's Sale", value: 0 },
    { title: "This Month's Sale", value: 1100 },
    { title: "Previous Month's Sale", value: 0 }
  ];

  return (
    <div className="containe1">
      <div className="row">
        {cardData.map((card, index) => (
          <div key={index} className="col-12 col-sm-6 col-lg-3 d-flex">
            <div style={cardStyle} className="w-100">
              <div className="px-3 mb-4">
                <header style={headerStyle}>{card.title}</header>
                <div style={bodyStyle}>
                  <div>{card.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashBoardCard;
