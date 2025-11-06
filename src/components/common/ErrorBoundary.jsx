import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // עדכון המצב כדי שהרינדור הבא יציג את ממשק המשתמש החלופי.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // כאן אפשר לשלוח את השגיאה לשירות חיצוני (למשל Sentry, LogRocket)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // ממשק משתמש חלופי במקרה של שגיאה
      return (
        <div style={{ padding: '20px', border: '1px solid red', borderRadius: '8px', backgroundColor: '#fff0f0', direction: 'rtl', textAlign: 'right' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#d32f2f' }}>אופס, משהו השתבש.</h1>
          <p>אנו מתנצלים, אך התרחשה שגיאה בלתי צפויה בעת טעינת הרכיב.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            <summary>פרטים טכניים (למפתחים)</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    // אם אין שגיאה, פשוט מרנדרים את הילדים
    return this.props.children;
  }
}

export default ErrorBoundary;