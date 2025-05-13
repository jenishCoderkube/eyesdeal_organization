import React, { useState, useEffect } from 'react'

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

  const [cardData, setCardData] = useState([
    { title: "Today's Sale", value: 0 },
    { title: "This Week's Sale", value: 0 },
    { title: "This Month's Sale", value: 0 },
    { title: "Previous Month's Sale", value: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          console.error('User data not found in localStorage');
          return;
        }

        const user = JSON.parse(userData);
        const userId = user._id;
        // const userId = "64e30076c68b7b37a98b4b4c";

        if (!userId) {
          console.error('User ID not found in user data');
          return;
        }

        const response = await fetch(`https://devnode.coderkubes.com/eyesdeal-api/dashboard?id=${userId}`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const apiData = result.data[0];
          setCardData([
            { title: "Today's Sale", value: apiData.todaySales },
            { title: "This Week's Sale", value: apiData.weekSales },
            { title: "This Month's Sale", value: apiData.monthSales },
            { title: "Previous Month's Sale", value: apiData.prevMonthSales }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

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