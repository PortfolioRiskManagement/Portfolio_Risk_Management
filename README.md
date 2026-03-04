# Portfolio_Risk_Management

#### Table of Contents 
- [Description](#desc)
- [Usage Guide](#inst)
  * [Installation](#inst1)
  * [Application Demonstration](#demo)
- [Client Meet](#cli)
- [Contributors](#cont)
- [License](#lics)

<a name="desc"></a>
## Description

Modern investing platforms provide users with numbers, charts, and percentages. However, they rarely explain what those numbers actually mean. Investors are left with a portfolio balance and a return percentage without understanding the risks they are exposed to, the consequences of their decisions, or how their portfolio might behave under adverse conditions.

This project introduces an **AI-assisted portfolio risk interpretation platform designed to bridge that gap.**

Rather than executing trades or providing investment recommendations, the platform focuses on understanding how and why a portfolio behaves the way it does. By analyzing user-provided portfolio data alongside historical market information, the system reconstructs the story behind each investment decision by highlighting risk exposure, behavioral patterns, and potential vulnerabilities that are often invisible in traditional brokerage tools.

The platform operates as an external intelligence layer. Users import their portfolio data through a secure, user-initiated process and explore their investments in a separate analytical environment. This separation ensures that the system remains focused on education, transparency, and decision analysis rather than execution.

Key capabilities include:
- Portfolio-level risk assessment (volatility, drawdowns, concentration risk)
- Asset-level and transaction-level analysis
- Interactive risk exploration and scenario analysis
- Natural-language explanations of complex financial metrics

<a name="inst"></a>
## Usage Guide

<a name="inst1"></a>
### Installation

1. Requirements:
- Node.js (LTS recommended)
- npm

2. Run the following commands in your terminal:
<br><code>npm install</code><br><br><code>npm run dev</code>

The application will be available locally at:
<br><code>http://localhost:5173</code>

<a name="demo"></a>
### Application Demonstration

Below are screenshots demonstrating the current state of the application UI and navigation.
<br>_^TODO when app is more extensive^_

![][appDemo]

<a name="cli"></a>
## Client Meet
- Requirements and feature requests are discussed during weekly client-style meetings
- Each meeting documents:
  - What was completed since the previous meeting
  - What was demonstrated to the client
  - What the client liked
  - What the client requested next

Weekly meeting notes can be found here:
<br>https://github.com/PortfolioRiskManagement/Portfolio_Risk_Management/tree/main/docs/meetings

<a name="cont"></a>
## Contributors

- [Michael Haddad](https://github.com/MichaelHaddad47)
- [Henry Saber](https://github.com/HenrySaber)
- [Mathew Aoun](https://github.com/Mathewaoun)

<a name="lics"></a>
## License

This project is licensed under the GPL-3.0 License.  
[License Details](../master/LICENSE.md)

[appDemo]: ./docs/demo-placeholder.gif
