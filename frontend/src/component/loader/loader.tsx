
import styled from "styled-components";

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <div className="justify-content-center jimu-primary-loading" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;

  .jimu-primary-loading {
    text-indent: -9999em;
    background: #076fe5;
    animation: loading-keys-app-loading 0.8s infinite ease-in-out;
    width: 13.6px;
    height: 32px;
    position: relative;
    margin: 0 20px;
    animation-delay: 0.16s;
  }

  .jimu-primary-loading:before,
  .jimu-primary-loading:after {
    content: "";
    position: absolute;
    width: 13.6px;
    height: 32px;
    background: #076fe5;
    animation: loading-keys-app-loading 0.8s infinite ease-in-out;
  }

  .jimu-primary-loading:before {
    left: -20px;
  }

  .jimu-primary-loading:after {
    left: 20px;
    animation-delay: 0.32s;
  }

  @keyframes loading-keys-app-loading {
    0%,
    80%,
    100% {
      opacity: 0.75;
      height: 32px;
      box-shadow: 0 0 #076fe5;
    }
    40% {
      opacity: 1;
      height: 40px;
      box-shadow: 0 -8px #076fe5;
    }
  }
`;

export default Loader;
