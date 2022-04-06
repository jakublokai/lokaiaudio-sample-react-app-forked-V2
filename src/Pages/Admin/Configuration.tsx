import React, { useState } from 'react';
import { useCookies, withCookies } from 'react-cookie';
import validator from 'validator';

import { resetClient, Client } from '../../Client';
import { defaultProjectId, getSampleProjectItems } from '../../Utilities/SelectedProject';
import KontentLogo from '../../Images/Admin/kk-logo.svg';

import './Configuration.css';
import { spinnerService } from '@simply007org/react-spinners';
import SpinnerLayout from '../../Components/SpinnerLayout';
import { useNavigate } from 'react-router-dom';
import { selectedProjectCookieName } from '../../const';


const getWindowCenterPosition = (windowWidth: number, windowHeight: number) => {
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;
  const screenWidth = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : window.screen.width;
  const screenHeight = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : window.screen.height;
  const left = screenWidth / 2 - windowWidth / 2 + dualScreenLeft;
  const top = screenHeight / 2 - windowHeight / 2 + dualScreenTop;
  return { left, top };
};

const Configuration: React.FC = () => {
  const [cookie] = useCookies([selectedProjectCookieName])
  const navigate = useNavigate();
  const [currentProjectInputValue, setcurrentProjectInputValue] = useState(cookie.ProjectId)
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     currentProjectInputValue: this.props.cookies.get(
  //       selectedProjectCookieName
  //     ),
  //   };

  //   this.handleProjectInputChange = this.handleProjectInputChange.bind(this);
  //   this.handleSetProjectSubmit = this.handleSetProjectSubmit.bind(this);
  //   this.setNewProjectId = this.setNewProjectId.bind(this);
  //   this.receiveMessage = this.receiveMessage.bind(this);
  //   this.waitUntilProjectAccessible = this.waitUntilProjectAccessible.bind(
  //     this
  //   );
  // }

  // componentDidMount() {
  //   window.addEventListener('message', this.receiveMessage, false);
  // }
  //
  // componentWillUnmount() {
  //   window.removeEventListener('message', this.receiveMessage);
  // }

  const handleProjectInputChange = (event: any) =>  {
    setcurrentProjectInputValue(event.taget.value);
  }

  const handleSetProjectSubmit = (event:any) => {
    event.preventDefault();
    const newProjectId = event.target[0].value;

    setNewProjectId(newProjectId);
  }

  const setNewProjectId = (newProjectId: any, newlyGeneratedProject: any = null) => {
    if (!validator.isUUID(newProjectId)) {
      const message = `Selected project (${newProjectId}) is not a valid GUID`;
      console.error(message);
      alert(message);
      setcurrentProjectInputValue(cookie.ProjectId);
      // this.setState({
      //   currentProjectInputValue: this.props.cookies.get(
      //     selectedProjectCookieName
      //   )
      // });
      return;
    }

    resetClient(newProjectId);
    if (newlyGeneratedProject) {
      waitUntilProjectAccessible(newProjectId);
      spinnerService.show("apiSpinner");
      return;
    }

    redirectToHome(newProjectId);
  }

  const waitUntilProjectAccessible = (newProjectId: any) => {
    setTimeout(() => {
      resetClient(newProjectId);
      Client.items()
        .elementsParameter(['id'])
        .depthParameter(0)
        .toPromise()
        .then(response => {
          getSampleProjectItems().then(
            sampleProjectClientResult => {
              resetClient(newProjectId);
              if (
                response.data.items.length >= sampleProjectClientResult.data.items.length
              ) {
                spinnerService.hide("apiSpinner");
                redirectToHome(newProjectId);
              } else {
                waitUntilProjectAccessible(newProjectId);
              }
            }
          );
        });
    }, 2000);
  }

  const redirectToHome = (newProjectId: any) => {
    const infoMessage =
      newProjectId === defaultProjectId
        ? `You've configured your app to with a project ID of a shared Kontent project.`
        : `You've configured your app with a project ID "${newProjectId}". You can edit its contents at https://kontent.ai/.`;
    navigate(`/?infoMessage=${infoMessage}`);
    //this.props.history.push(`/?infoMessage=${infoMessage}`);
  }

  const openKenticoKontentProjectSelector = (event: any) => {
    event.preventDefault();
    const windowWidth = 800;
    const windowHeight = 800;
    const { left, top } = getWindowCenterPosition(windowWidth, windowHeight);

    window.open(
      'https://app.kontent.ai/sample-site-configuration',
      'Kentico Kontent',
      `status=no,width=${windowWidth},height=${windowHeight},resizable=yes,left=
      ${left},top=${top},toolbar=no,menubar=no,location=no,directories=no`
    );
  }

  const receiveMessage= (event: any) => {
    if (event.origin.toLowerCase() !== 'https://app.kontent.ai') return;

    if (!event.data.projectGuid) {
      return;
    }

    setNewProjectId(
      event.data.projectGuid,
      event.data.newlyGeneratedProject
    );
  }

    return (
      <SpinnerLayout>
        <div className="configuration-page">
          <div className="gradient-desk padding-bottom-xl">
            <div className="kk-container">
              <a href="/" className="logo-link">
                <img className="logo" src={KontentLogo} alt="Kentico Kontent logo" />
              </a>
            </div>
            <header>
              <div className="kk-container">
                <h1 className="headline-large">Sample Site—Configuration</h1>
                <p className="margin-top-xl">
                  For your sample app to work, you should have a Kontent
                  project containing content. Your app should be then configured
                  with its project ID. You can either get it by signing in using
                  your Kontent credentials or by signing up for a trial.
                  Later, it will be converted to a free plan.
                </p>
              </div>
            </header>
            <div className="kk-container">
              <section className="paper margin-top-xl">
                <h2 className="headline-medium">Get a Project ID</h2>
                <p className="margin-top-l">
                  You may wish to either select from existing projects or create a new
                  sample project. The app will be configured with its project ID.
                </p>
                <form onSubmit={openKenticoKontentProjectSelector}>
                  <input
                    type="submit"
                    className="button button-primary margin-top-xl"
                    value="Get Project ID from Kontent"
                  />
                </form>
              </section>
            </div>
            <div className="kk-container">
              <div className="row-lg row-lg--align-start">
                <section className="col paper margin-top-xl">
                  <h2 className="headline-medium">Set A Project ID Manually</h2>
                  <p className='margin-top-l'>
                    Alternatively, you can configure your app manually by submitting a
                    project ID below.
                  </p>
                  <form className='project-id-form margin-top-xl' onSubmit={handleSetProjectSubmit}>
                    <input
                      aria-label='Project ID'
                      autoComplete='off'
                      id="ProjectGuid"
                      name="ProjectGuid"
                      placeholder="Project ID"
                      type="text"
                      value={currentProjectInputValue}
                      onChange={handleProjectInputChange}
                      className="project-id-form__input text-box single-line"
                    />
                    <span className="field-validation-valid" data-valmsg-for="ProjectGuid" data-valmsg-replace="true"></span>
                    <input
                      type="submit"
                      className="button button-primary project-id-form__submit-button"
                      value="Submit"
                    />
                  </form>
                </section>
                <section className="col paper margin-top-xl">
                  <h2 className='headline-medium'>Use the Shared Project</h2>
                  <p className='margin-top-l'>
                    Alternatively, you may wish to use the shared project (project ID
                    "{defaultProjectId}
                    ").
                  </p>
                  <p className='margin-top-l'>
                    <strong>Note:</strong> You cannot edit content in the shared
                    project.
                  </p>
                  <input
                    type="submit"
                    className="button button-primary margin-top-xl"
                    value="Use the shared project"
                    onClick={() => setNewProjectId(defaultProjectId)}
                  />
                </section>
              </div>
            </div>
          </div>
        </div>
      </SpinnerLayout>
    );
}

export default withCookies(Configuration);
