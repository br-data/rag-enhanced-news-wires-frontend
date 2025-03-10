import React, { useEffect, useState } from "react";
import {
  mergeStyleSets,
  MessageBar,
  MessageBarType,
  Persona,
  PersonaSize,
  PrimaryButton,
  Spinner,
  Stack,
  TextField,
} from "@fluentui/react";
import { useParams } from "react-router-dom";

import wires from "../../data/wires-all.json";
import mockResponse from "../../data/response.json";
import useFetch from "../../global/hooks/useFetch";

const Details: React.FunctionComponent = () => {
  interface GenericResponse {
    Hintergrund: any;
    questions_and_answers: any[];
  }

  interface GenericRequest {
    [key: string]: any;
  }

  interface RouteParams {
    id: string;
  }

  const { id } = useParams<RouteParams>();
  const wire = wires.find((item) => item.id === id);
  const [url, setUrl] = useState<string>(
    "https://europe-west3-brdata-live.cloudfunctions.net/echo",
  );
  const [body, setBody] = useState<GenericRequest>(mockResponse);

  useEffect(() => {
    if (id === "demo") {
      setUrl("https://europe-west3-brdata-live.cloudfunctions.net/echo");
      setBody(mockResponse);
    } else {
      setUrl(
        "http://accio.germanywestcentral.cloudapp.azure.com:8000/generate-enriched-report",
      );
      setBody({ meldung: wire?.article_html });
    }
  }, [id, wire]);

  const { data, loading, error, executeFetch } = useFetch<GenericResponse>(
    url,
    {
      method: "POST",
      body,
    },
  );

  const [sleeping, setSleeping] = useState(false);

  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleClick = async () => {
    setSleeping(true);
    await sleep(id === "demo" ? 5000 : 0);
    executeFetch();
    setSleeping(false);
  };

  const classNames = mergeStyleSets({
    container: { marginBottom: "2rem" },
    header: { margin: ".5em 0" },
    loading: { marginTop: "2rem" },
    enhancedInfo: {
      margin: "2rem 0",
      paddingLeft: "15px",
      borderLeft: "5px solid #0078d4",
    },
    list: { padding: "4px", listStyle: "inside" },
    warning: { margin: "2rem 0" },
  });

  return (
    <div className={classNames.container}>
      <h1 className={classNames.header}>{wire?.headline}</h1>
      <p>{wire?.created_at}</p>
      <div dangerouslySetInnerHTML={{ __html: wire?.article_html || "" }} />
      {(sleeping || loading) && (
        <Stack className={classNames.loading}>
          <Spinner
            label="Searching for text enrichments"
            ariaLive="assertive"
            labelPosition="right"
          />
        </Stack>
      )}
      {error && (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
          Error: {error.message}
        </MessageBar>
      )}
      {data && (
        <>
          <section className={classNames.enhancedInfo}>
            <h3>Generated info</h3>
            <p dangerouslySetInnerHTML={{ __html: data.Hintergrund || "" }} />
          </section>
          <section>
            <h3>Questions and sources</h3>
            <ul className={classNames.list}>
              {data.questions_and_answers?.map((question, index) => (
                <li key={`question-${index}`}>
                  {question.question} (
                  {question.links &&
                    question.links?.length &&
                    question.links?.map((link: string, index: number) => (
                      <>
                        <a
                          key={`link-${index}`}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Source {index + 1}
                        </a>
                        {index === question.links!.length - 1 ? "" : ", "}
                      </>
                    ))}
                  )
                </li>
              ))}
            </ul>
          </section>
          <h3 className={classNames.loading}>Custom search</h3>
          <Stack horizontal verticalAlign="center">
            <Stack.Item>
              <Persona
                imageInitials="JP"
                size={PersonaSize.size40}
                imageAlt="Jörg Pfeiffer"
              />
            </Stack.Item>
            <Stack.Item grow={true}>
              <TextField
                placeholder="Type your own question ..."
                iconProps={{ iconName: "Send" }}
              />
            </Stack.Item>
          </Stack>
          <MessageBar
            className={classNames.warning}
            messageBarType={MessageBarType.warning}
            isMultiline={false}
          >
            Please make sure to double-check the generated content and sources.
          </MessageBar>
        </>
      )}
      {!data && !loading && !sleeping && (
        <Stack>
          <Stack.Item align="center">
            <PrimaryButton
              style={{ marginTop: "1rem" }}
              text="Generate enrichments"
              onClick={handleClick}
              iconProps={{ iconName: "CompassNW" }}
              allowDisabledFocus
            />
          </Stack.Item>
        </Stack>
      )}
    </div>
  );
};

export default Details;
