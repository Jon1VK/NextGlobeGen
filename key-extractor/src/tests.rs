use crate::{ExtractedKey, KeyExtractorVisitor};
use swc_common::{FileName, SourceMap, sync::Lrc};
use swc_core::ecma::parser::{Parser, StringInput, Syntax, TsSyntax, lexer::Lexer};
use swc_ecma_ast::Module;
use swc_ecma_visit::VisitMutWith;

fn parse_module(code: &str) -> Module {
    let source_map: Lrc<SourceMap> = Default::default();
    let source_file = source_map.new_source_file(
        Lrc::new(FileName::Custom("test.tsx".into())),
        code.to_string(),
    );
    let lexer = Lexer::new(
        Syntax::Typescript(TsSyntax {
            tsx: true,
            ..Default::default()
        }),
        Default::default(),
        StringInput::from(&*source_file),
        None,
    );
    let mut parser = Parser::new_from(lexer);
    parser.parse_module().unwrap()
}

fn assert_extracted_keys_eq(code: &str, expected_keys: Vec<ExtractedKey>) {
    let mut module = parse_module(code);
    let mut visitor = KeyExtractorVisitor::new();
    module.visit_mut_with(&mut visitor);
    assert_eq!(visitor.extracted_keys, expected_keys);
}

#[test]
fn use_translations() {
    assert_extracted_keys_eq(
        r#"
        import { useTranslations } from 'next-globe-gen';
        
        function Component() {
            const t = useTranslations('common');
            return t('greeting', { _defaultMessage: 'Welcome!', _description: 'A welcome message' });
        }
    "#,
        vec![ExtractedKey {
            key: "common.greeting".into(),
            message: "Welcome!".into(),
            description: Some("A welcome message".into()),
        }],
    );
}

#[test]
fn use_translations_without_namespace() {
    assert_extracted_keys_eq(
        r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations();
            return t('hello', { _defaultMessage: 'Hello World', _description: 'Hello message' });
        }
    "#,
        vec![ExtractedKey {
            key: "hello".into(),
            message: "Hello World".into(),
            description: Some("Hello message".into()),
        }],
    );
}

#[test]
fn use_translations_without_description_and_message() {
    assert_extracted_keys_eq(
        r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations('ns');
            return t('key');
        }
    "#,
        vec![ExtractedKey {
            key: "ns.key".into(),
            message: "[missing]".into(),
            description: None,
        }],
    );
}

#[test]
fn get_translations_async() {
    assert_extracted_keys_eq(
        r#"
        import { getTranslations } from 'next-globe-gen';

        async function Page() {
            const t = await getTranslations('page');
            return t('title', { _defaultMessage: 'Page Title', _description: 'Page title' });
        }
    "#,
        vec![ExtractedKey {
            key: "page.title".into(),
            message: "Page Title".into(),
            description: Some("Page title".into()),
        }],
    );
}

#[test]
fn create_translator_server_function() {
    assert_extracted_keys_eq(
        r#"
        import { createTranslator } from 'next-globe-gen';

        export async function serverFunction() {
            "use server";
            const t = createTranslator('en', 'server');
            return t('key', { _defaultMessage: 'Server Key', _description: 'Server function key' });
        }
    "#,
        vec![ExtractedKey {
            key: "server.key".into(),
            message: "Server Key".into(),
            description: Some("Server function key".into()),
        }],
    );
}

#[test]
fn multiple_translators() {
    assert_extracted_keys_eq(
        r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations('common');
            const tPage = useTranslations('page');
            return (
                <>
                    {t('header', { _defaultMessage: 'Header', _description: 'Header text'})}
                    {tPage('content', { _defaultMessage: 'Content', _description: 'Page content'})}
                </>
            );
        }
    "#,
        vec![
            ExtractedKey {
                key: "common.header".into(),
                message: "Header".into(),
                description: Some("Header text".into()),
            },
            ExtractedKey {
                key: "page.content".into(),
                message: "Content".into(),
                description: Some("Page content".into()),
            },
        ],
    );
}

#[test]
fn values_as_template_literals() {
    assert_extracted_keys_eq(
        r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations('ns');
            return t(`staticKey`, { _defaultMessage: `Static message`, _description: `Static description` });
        }
    "#,
        vec![ExtractedKey {
            key: "ns.staticKey".into(),
            message: "Static message".into(),
            description: Some("Static description".into()),
        }],
    );
}

#[test]
fn renamed_import() {
    assert_extracted_keys_eq(
        r#"
        import { useTranslations as useT } from 'next-globe-gen';

        function Component() {
            const translate = useT('ns');
            return translate('key');
        }
    "#,
        vec![ExtractedKey {
            key: "ns.key".into(),
            message: "[missing]".into(),
            description: None,
        }],
    );
}

#[test]
fn nested_key() {
    assert_extracted_keys_eq(
        r#"
        import { useTranslations } from 'next-globe-gen';

        function Component() {
            const t = useTranslations('section');
            return t('nested.deep.key');
        }
    "#,
        vec![ExtractedKey {
            key: "section.nested.deep.key".into(),
            message: "[missing]".into(),
            description: None,
        }],
    );
}
